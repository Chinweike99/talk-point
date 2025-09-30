import { Request, Response } from "express";
import { addUserToRoom, creatRoom, getAllRooms, getMyRooms, getRoomById, joinRoom, leaveRoom } from "../services/rooms";




export const createRoomController = async(req: Request, res: Response) => {
    try {
        const {name, description, isPublic = true} = req.body;
        if(!name){
            return res.status(400).json({error: 'Room name is required'});
        }
        const room = await creatRoom(name, description, isPublic, req.user?.id as string)
        res.status(201).json(room)
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getRooms = async (req:Request, res: Response) => {
  try {
    const rooms = await getAllRooms(req.user?.id);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const room = await getRoomById(roomId, req.user?.id);
    res.json(room);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

export const joinRoomHandler = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const result = await joinRoom(roomId, req.user?.id as string);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const addToRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await addUserToRoom(roomId, userId, req.user?.id as string);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const leaveRoomHandler = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const result = await leaveRoom(roomId, req.user?.id as string);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getMyRoomsHandler = async (req: Request, res: Response) => {
  try {
    const rooms = await getMyRooms(req.user?.id as string);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};