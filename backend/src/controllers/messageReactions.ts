// src/controllers/messageReactions.ts
import { Request, Response } from 'express';
import { addReaction, removeReaction, getMessageReactions } from '../services/messageReactions.js';


export const addReactionHandler = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const reaction = await addReaction(messageId, req.user?.id as string, emoji);
    res.status(201).json(reaction);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const removeReactionHandler = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const result = await removeReaction(messageId, req.user?.id as string, emoji);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getReactionsHandler = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const reactions = await getMessageReactions(messageId);
    res.json(reactions);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};