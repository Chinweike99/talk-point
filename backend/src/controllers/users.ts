import { Response } from "express";
import { getAdminProfile, getAllUsers, getUserById } from "../services/user"
import { AuthRequest } from "../types"





export const getUsers = async(req: AuthRequest, res: Response) => {
    try {
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                error: "Admin access required"
            })
        };
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({error: (error as Error).message})
    }
}


export const getUserProfile = async(req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await getUserById(userId);

        if(req.user.role !== 'ADMIN' && user.role !== 'ADMIN'){
            return res.status(403).json({ error: 'Can only view admin profile' });
        };
        res.json(user)
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
}


export const getMyProfile = async(req: AuthRequest, res: Response) => {
    try {
        const user = await getUserById(req.user.id);
        res.json(user)
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
}

export const getAdmin = async(req: AuthRequest, res: Response) => {
    try {
        const admin = await getAdminProfile();
        res.json(admin)
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
}


