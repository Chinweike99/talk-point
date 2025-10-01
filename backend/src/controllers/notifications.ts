// src/controllers/notifications.ts
import { Request, Response } from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotifications 
} from '../services/notification';;

export const getNotificationsHandler = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getUserNotifications(req.user?.id as any, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const markAsReadHandler = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const result = await markNotificationAsRead(notificationId, req.user?.id as any);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const markAllAsReadHandler = async (req: Request, res: Response) => {
  try {
    const result = await markAllNotificationsAsRead(req.user?.id as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteNotificationHandler = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const result = await deleteNotifications(notificationId, req.user?.id as any);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};