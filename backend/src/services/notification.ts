import { success } from "zod";
import prisma from "../config/database"
import { consumeFromQueue } from "./rabbitmq";




export const createNotification = async(user_id: string, type: string, data:any) => {
    const notification = await prisma.notifications.create({
        data: {
            user_id,
            type,
            data: JSON.stringify(data),
            is_read: false
        }
    });
    return notification;
}


export const getUserNotifications = async(userId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;

    const notifications = await prisma.notifications.findMany({
        where: {user_id: userId},
        orderBy: {created_at: 'desc'},
        skip,
        take: limit
    });

    const total = await prisma.notifications.count({where: {user_id: userId}});

    // Parse notifications data
    const parsedNotifications = notifications.map(notification => ({
        ...notification, data: JSON.parse(notification.data)
    }));

    return {
        notifications: parsedNotifications,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total,
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    }
};


export const markNotificationAsRead = async(notificationId: string, userId: string) => {
    const notification = await prisma.notifications.update({
        where: {id: notificationId, user_id: userId},
        data: {is_read: true}
    });
    return notification;
};


export const markAllNotificationsAsRead = async(user_id: string) => {
    const allNotifications = await prisma.notifications.updateMany({
        where: {user_id, is_read: false},
        data: {is_read: true}
    });
    return allNotifications;
}

export const deleteNotifications = async(notificationId: string, userId: string) =>{
    await prisma.notifications.delete({
        where: {id: notificationId, user_id: userId}
    });
    return {success}
};

export const deletAllNotifications = async(userId: string) => {
    await prisma.notifications.deleteMany({
        where: {user_id: userId}
    });
    return { success }
}

// Notification types and templates
const notificationTemplates = {
  MESSAGE_RECEIVED: (data: any) => ({
    title: 'New Message',
    message: `You have a new message from ${data.senderName}`,
    action: `/chat/${data.senderId}`,
    priority: 'normal'
  }),
  ROOM_INVITE: (data: any) => ({
    title: 'Room Invitation',
    message: `You've been invited to join ${data.roomName}`,
    action: `/rooms/${data.roomId}`,
    priority: 'high'
  }),
  USER_BANNED: (data: any) => ({
    title: 'Account Suspended',
    message: `Your account has been suspended. Reason: ${data.reason || 'Violation of terms'}`,
    action: '/support',
    priority: 'urgent'
  }),
  MESSAGE_DELETED: (data: any) => ({
    title: 'Message Removed',
    message: 'One of your messages was removed by an administrator',
    action: '/guidelines',
    priority: 'normal'
  })
};

export const formatNotification = (type: string, data: any) => {
  const template = notificationTemplates[type as keyof typeof notificationTemplates];
  return template ? template(data) : {
    title: 'Notification',
    message: 'You have a new notification',
    action: '/notifications',
    priority: 'normal'
  };
};


// Initialize notification consumer
export const setupNotificationConsumer = () => {
    consumeFromQueue('notification_queue', async(message) => {
        console.log('processing notification: ', message);

        try {
      console.log('Processing notification:', message);

      switch (message.type) {
        case 'USER_BANNED':
          await createNotification(message.userId, 'USER_BANNED', {
            reason: message.reason,
            timestamp: message.timestamp
          });
          break;

        case 'MESSAGE_DELETED':
          await createNotification(message.originalSenderId, 'MESSAGE_DELETED', {
            messageId: message.messageId,
            timestamp: message.timestamp
          });
          break;

        case 'ROOM_INVITE':
          await createNotification(message.userId, 'ROOM_INVITE', {
            roomId: message.roomId,
            roomName: message.roomName,
            invitedBy: message.invitedBy,
            timestamp: message.timestamp
          });
          break;

        default:
          console.log('Unknown notification type:', message.type);
      }
    } catch (error) {
      console.error('Error processing notification:', error);
    }

    })
}


