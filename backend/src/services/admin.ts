import prisma from "../config/database"
import { sendToQueue } from "./rabbitmq";



export const banUser = async(userId: string, bannedBy: string, reason?: string) => {
    const admin = await prisma.user.findUnique({
        where: {id: bannedBy, role: 'ADMIN'}
    });
    if(!admin){
        throw new Error("Only Admins can ban user")
    };

    // Check if user exists and is not already banned
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.role === 'ADMIN') {
            throw new Error('Cannot ban another admin');
        }

        // Create ban user
        const bannedRecord = await prisma.user.update({
            where: {id: userId},
            data: {
                isOnline: false,
                lastSeen: new Date()
            },
            select: {
                id: true,
                username: true,
                email: true,
                isOnline: true
            }
        });
        // Send To notifications Queue
        await sendToQueue('notification_queue', {
            type: "USER_BANNED",
            userId,
            bannedBy,
            reason,
            timestamp: new Date()
        });

        return bannedRecord
};



export const unbanUser = async(userId: string, unbannedBy: string) => {
    const admin = await prisma.user.findUnique({
        where: {id: unbannedBy, role: 'ADMIN'}
    });

    if (!admin) {
        throw new Error('Only admins can unban users');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

     await sendToQueue('notification_queue', {
        type: 'USER_UNBANNED',
        userId,
        unbannedBy,
        timestamp: new Date()
    });

    return { message: 'User unbanned successfully' };
}



export const deleteMessage = async (messageId: string, deletedBy: string) => {

    // Verify deleter is admin
    const admin = await prisma.user.findUnique({
        where: { id: deletedBy, role: 'ADMIN' }
    });

    if (!admin) {
        throw new Error('Only admins can delete messages');
    }

    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
        sender: true,
        room: true
        }
    });

    if(!message){
        throw new Error("Message not found")
    };

    // Soft delete by updating content
    const deleteMessage = await prisma.message.update({
        where: {id: messageId},
        data: {
            content: '[Message deleted by admin]',
            imageUrl: null
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

    // Notify relevant users about message deletion
    const notificationData = {
        type: 'MESSAGE_DELETED',
        messageId,
        deletedBy,
        originalSenderId: message.senderId,
        roomId: message.roomId,
        receiverId: message.receiverId,
        timestamp: new Date()
    };

    await sendToQueue('notification_queue', notificationData);
    await sendToQueue('message_queue', {
        ...notificationData,
        message: deleteMessage
    });

    return deleteMessage;
};


export const getSystemStatistics = async() => {
    const [
        totalUsers,
        onlineUsers,
        totalRooms,
        totalMessages,
        recentMessages,
        activeRooms
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({where: {isOnline: true}}),
        prisma.room.count(),
        prisma.message.count(),
        prisma.message.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 1000)
                }
            }
        }),
        prisma.room.findMany({
            where: {
                messages: {
                    some: {
                        createdAt: {
                            gte: new Date(Date.now() - 60 * 60 * 1000)
                        }
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        messages: {
                            where: {
                                createdAt: {
                                    gte: new Date(Date.now() - 60 * 60 * 1000)
                                }
                            }
                        }
                    }
                }
            },
            take: 10
        })
    ]);

    return {
        totalUsers,
        onlineUsers,
        totalRooms,
        totalMessages,
        recentMessages24h: recentMessages,
        activeRooms: activeRooms.map(room => ({
            id: room.id,
            name: room.name,
            memberCount: room._count.members
        }))
    };
}


export const getMessageAnalytics = async(timeRange: '24h' | '7d' | '30d' = '24h') => {
    const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 *60 * 1000
    }
    const startTime = new Date(Date.now() - timeRanges[timeRange]);
    const messages = await prisma.message.groupBy({
        by: ['messageType'],
        where: {
            createdAt: {
                gte: startTime
            }
        },
        _count: {
            id: true
        }
    });

    const hourlyData = await prisma.message.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: {
                gte: startTime
            }
        },
        _count: {
            id: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // Format hourly data for chats
    const formattedHourlyData = hourlyData.map(item => ({
        hour: item.createdAt.toISOString(),
        count: item._count.id
    }));

    return {
        MessageType: messages,
        hourlyData: formattedHourlyData,
        timeRange
    }
};


export const purgeUserMessages = async(userId: string, purgedBy: string) => {
    const admin = await prisma.user.findUnique({
        where: {id: purgedBy, role: 'ADMIN'}
    });

    if (!admin) {
        throw new Error('Only admins can purge user messages');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.role === 'ADMIN') {
        throw new Error('Cannot purge admin messages');
    }

    // Update all user's messages to show as deleted
    const result = await prisma.message.updateMany({
        where: { senderId: userId },
        data: {
        content: '[Message purged by admin]',
        imageUrl: null
        }
    });

    await sendToQueue('notification_queue', {
        type: 'USER_MESSAGES_PURGED',
        userId,
        purgedBy,
        messageCount: result.count,
        timestamp: new Date()
    });

    return {
    message: `Purged ${result.count} messages from user ${user.username}`,
    count: result.count
  };
}




