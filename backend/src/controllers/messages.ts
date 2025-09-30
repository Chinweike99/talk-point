import { Request, Response } from "express";
import { getConversations, getDirectMessages, getRoomMessages, markMessagesAsRead, sendMessage } from "../services/messages";


export const sendMessageHandler = async(req: Request, res: Response) => {
    try {
        const {content, roomId, receiverId} = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const message = await sendMessage(content, req.user?.id as any, roomId, receiverId, imageUrl);
        res.status(201).json({message})
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
}

export const getRoomMessagesHandler = async(req: Request, res: Response) => {
    try {
        const user = req.user?.id as string
        const roomId = req.params.roomId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const result = await getRoomMessages(roomId, user, page, limit)
        res.json(result)
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
}

export const getDirectMessagesHandler = async (req: Request, res: Response) => {
  try {
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await getDirectMessages(req.user?.id as string, otherUserId, page, limit);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};


export const getConversationsHandler = async (req: Request, res: Response) => {
  try {
    const conversations = await getConversations(req.user?.id as string);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const markAsReadHandler = async (req: Request, res: Response) => {
  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'Message IDs array is required' });
    }

    const result = await markMessagesAsRead(messageIds, req.user?.id as string);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// export const getRoomMessagesHandler = async(req: Request, res: Response) => {

// }
