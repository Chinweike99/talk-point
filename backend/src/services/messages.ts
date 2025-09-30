import prisma from "../config/database";
import { sendToQueue } from "./rabbitmq";



export const sendMessage = async(content: string, senderId: string, roomId?: string, receiverId?: string, imageUrl?: string) => {
    if(!content && !imageUrl){
        throw new Error('Message content or image is required');
    };

    if (roomId && receiverId) {
    throw new Error('Cannot specify both room and receiver for a message');
    }
    if (!roomId && !receiverId) {
        throw new Error('Either room or receiver must be specified');
    };

    if(roomId){
        const roomMembership = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId: senderId,
                    roomId
                }
            }
        });
        if (!roomMembership) {
            throw new Error('You are not a member of this room');
        }
    };

     // Validate receiver exists if direct message
    if (receiverId) {
        const receiver = await prisma.user.findUnique({
        where: { id: receiverId }
        });

        if (!receiver) {
        throw new Error('Receiver not found');
        }
    };

    const message = await prisma.message.create({
        data: {
            content: content || '',
            imageUrl,
            messageType: imageUrl ? 'IMAGE' : 'TEXT',
            senderId,
            receiverId,
            roomId
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
            },
            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    // Sent to RabbitMQ for real-time delivery
    const messageEvent: any = {
        type: roomId ? 'ROOM_MESSAGE' : 'DIRECT_MESSAGE',
        message,
        roomId,
        receiverId
    };

    await sendToQueue('message_queue', messageEvent)
    return message;
};

export const getRoomMessages = async (roomId: string, userId: string, page: number = 1, limit: number = 50) => {
  // Verify user has access to the room
  const roomMembership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId
      }
    }
  });

  if (!roomMembership) {
    throw new Error('You do not have access to this room');
  }

  const skip = (page - 1) * limit;

  const messages = await prisma.message.findMany({
    where: { roomId },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const totalMessages = await prisma.message.count({
    where: { roomId }
  });

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
      hasNext: page * limit < totalMessages,
      hasPrev: page > 1
    }
  };
};

export const getDirectMessages = async (userId: string, otherUserId: string, page: number = 1, limit: number = 50) => {
  const skip = (page - 1) * limit;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: userId,
          receiverId: otherUserId
        },
        {
          senderId: otherUserId,
          receiverId: userId
        }
      ]
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
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const totalMessages = await prisma.message.count({
    where: {
      OR: [
        {
          senderId: userId,
          receiverId: otherUserId
        },
        {
          senderId: otherUserId,
          receiverId: userId
        }
      ]
    }
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      isRead: false
    },
    data: { isRead: true }
  });

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
      hasNext: page * limit < totalMessages,
      hasPrev: page > 1
    }
  };
};

export const getConversations = async(userId: string) => {
    // Get unique users that the current user has conversed with
    const conversations = await prisma.message.findMany({
        where: {
            OR: [
                {senderId: userId},
                { receiverId: userId}
            ]
        },
        include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true,
          isOnline: true
        }
      },
      receiver: {
        select: {
          id: true,
          username: true,
          avatar: true,
          isOnline: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
    });

    // Group by conversation parner
    const conversationsMap = new Map();
    conversations.forEach(message => {
        const otherUser = message.senderId === userId ? message.receiver : message.sender;
        if(!otherUser) return
        const conversationId = otherUser.id;
        if(!conversationsMap.has(conversationId)){
            conversationsMap.set(conversationId, {
                user: otherUser,
                lastMessage: message,
                unreadCount: 0
            })
        }
    });

    // Count unread messages for each conversation
    for(const [conversationId, conversation] of conversationsMap){
        const unreadCount = await prisma.message.count({
            where: {
                senderId: conversationId,
                receiverId: userId,
                isRead: false
            }
        });
        conversation.unreadCount = unreadCount
    };

    return Array.from(conversationsMap.values()).sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

};


export const markMessagesAsRead = async(messageIds: string[], userId: string) => {
    await prisma.message.updateMany({
        where: {
            id: {in: messageIds},
            receiverId: userId,
            isRead: false
        },
        data: { isRead: true}
    });
    return { success: true}
}



