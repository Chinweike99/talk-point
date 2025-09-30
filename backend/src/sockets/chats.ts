
import {Server as SocketIOServer} from 'socket.io';
import { verifyToken } from '../utils/helpers';
import prisma from '../config/database';
import { SocketAuth } from '../types';
import { consumeFromQueue, sendToQueue } from '../services/rabbitmq';

const connectedUsers = new Map();

export const setupSocketIO = (io: SocketIOServer) => {
    // Authenticate middleware for Socket.IO
    io.use(async(socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if(!token){
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = await verifyToken(token);
            if(!decoded){
                return next(new Error('Authentication error: Invalid token'));
            };

            const user = await prisma.user.findUnique({
                where: {id: decoded.id},
                select:{
                    id: true,
                    username: true,
                    role: true,
                    avatar: true
                }
            });
            if(!user){
                return next(new Error('Authentication error: User not found'));
            }
            socket.data.user = user;
            next()

        } catch (error) {
            console.log(error)
            next(new Error('Authentication error'));
        }
    });

    // Connection
    io.on('connection', (socket) =>{
        const user = socket.data.user as SocketAuth;
        console.log(`User ${user.username} connected`)
        // Add user to connected users map
        connectedUsers.set(user.userId, {
            socketId: socket.id,
            user: user
        });
        // Join user to their personal room for direct messages
        socket.join(`user_${user.userId}`)

        // Update user online presence
        prisma.user.update({
            where: {id: user.userId},
            data: {isOnline: true}
        }).catch(console.error);

            // Join room
        socket.on('join_room', async(roomId: string) => {
            try {
                // Verify that user is member of the room
                const membership = await prisma.roomMember.findUnique({
                    where: {
                        userId_roomId: {
                            userId: user.userId,
                            roomId
                        }
                    }
                });
                if(membership){
                    socket.join(`room_${roomId}`);
                    socket.to(`room_${roomId}`).emit('user_joined', {
                        user: user,
                        roomId,
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.log(error)
                socket.emit('error', { message: 'Failed to join room' });

            }
        });

        // Leave room
        socket.on('leave_room', (roomId: string) => {
            socket.leave(`room_${roomId}`);
            socket.to(`room_${roomId}`).emit('user_left', {
                user: user,
                roomId,
                timestamp: new Date()
            });
        });

        //Send message to room
        socket.on('send_room_message', async(data: {roomId: string; content: string}) => {
            try {
                const {roomId, content} = data;
                // Verify user is a member of the room
                const membership = await prisma.roomMember.findUnique({
                    where: {
                        userId_roomId: {
                            userId: user.userId,
                            roomId
                        }
                    }
                });
                    if (!membership) {
                    socket.emit('error', { message: 'You are not a member of this room' });
                    return;
                    };
                
                const message = await prisma.message.create({
                data: {
                    content,
                    senderId: user.userId,
                    roomId,
                    messageType: 'TEXT'
                },
                include: {
                    sender: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                    },
                    room: {
                    select: {
                        id: true,
                        name: true
                    }
                    }
                }
                });

                // Broadcast to room
                io.to(`room_${roomId}`).emit('room_message', message);

                // Send to RabbitMQ for processing (notifications, etc)
                await sendToQueue('message_queue', {
                    type: 'ROOM_MESSAGE',
                    message,
                    roomId
                })

            } catch (error) {
                console.log(error)
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Send direct message
        socket.on('send_direct_message', async(data: {receiverId: string; content: string}) => {
            try {
                const {receiverId, content} = data;
                // Verify reciever exists
                const reciever = await prisma.user.findUnique({
                    where: {id: receiverId}
                });

                if(!reciever){
                    socket.emit('error', {message: 'Reciever not found'});
                    return
                };

                const message = await prisma.message.create({
                data: {
                    content,
                    senderId: user.userId,
                    receiverId,
                    messageType: 'TEXT'
                },
                include: {
                    sender: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                    },
                    receiver: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                    }
                }
                });

            // Send to reciever if online
            const receiverSocket = connectedUsers.get(receiverId);
            if(receiverSocket){
                io.to(receiverSocket.socketId).emit('direct_message', message)
            }
            // Send to sender
            socket.emit('direct_message', message);

            // Sent to RabbitMQ for processing
            await sendToQueue('message_queue', {
                type: 'DIRECT_MESSAGE',
                message,
                receiverId
            })

            } catch (error) {
                console.log(error)
                socket.emit('error', { message: 'Failed to send message' });
            }
        });


        // Typing indicators
        socket.on('typing_start', (data: {roomId?: string; recieverId?: string}) => {
            if(data.roomId){
                socket.to(`room_${data.roomId}`).emit('user_typing', {
                    user: user,
                    roomId: data.roomId
                })
            }else if(data.recieverId) {
                const receiverSocket = connectedUsers.get(data.recieverId);
                if(receiverSocket){
                    io.to(receiverSocket.socketId).emit('user_typing', {
                        user: user,
                        isDirect: true
                    })
                }
            }
        });

            socket.on('typing_stop', (data: { roomId?: string; receiverId?: string }) => {
      if (data.roomId) {
        socket.to(`room_${data.roomId}`).emit('user_stop_typing', {
          user: user,
          roomId: data.roomId
        });
      } else if (data.receiverId) {
        const receiverSocket = connectedUsers.get(data.receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('user_stop_typing', {
            user: user,
            isDirect: true
          });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', ()=> {
        console.log(`User ${user.username} disconnected`);

        // Remove from connected users
        connectedUsers.delete(user.userId);

        //Update online status
        prisma.user.update({
            where: {id: user.userId},
            data: {
                isOnline: false,
                lastSeen: new Date()
            }
        }).catch(console.error)
    })

    });

    // RabbitMQ consumer for message processing
    consumeFromQueue('message_queue', async(message) => {
        try {
            console.log("processing message from queue:", message);

            if(message.type === 'DIRECT_MESSAGE'){
                const receiverSocket = connectedUsers.get(message.receiverId);
                if(!receiverSocket){
                    // User is offlin, could send push notificatons here
                    console.log(`User ${message.receiverId} is offline, message saves for later`);
                }
            }

        } catch (error) {
            console.error('Error processing message from queue:', error);
        }
    })


}

