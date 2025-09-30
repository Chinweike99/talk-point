import { Request, Response } from "express";
import { banUser, deleteMessage, getMessageAnalytics, getSystemStatistics, purgeUserMessages, unbanUser } from "../services/admin";



export const banUserHandler = async(req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;const result = await banUser(userId, req.user?.id as any, reason);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


export const unbanUserHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await unbanUser(userId, req.user?.id as any);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};


export const deleteMessageHandler = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const result = await deleteMessage(messageId, req.user?.id as any);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};


export const getStatisticsHandler = async (req: Request, res: Response) => {
  try {
    const statistics = await getSystemStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAnalyticsHandler = async (req: Request, res: Response) => {
  try {
    const { timeRange = '24h' } = req.query;
    const analytics = await getMessageAnalytics(timeRange as '24h' | '7d' | '30d');
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const purgeUserMessagesHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await purgeUserMessages(userId, req.user?.id as any);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}




