import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../utils/validation";
import { loginUser, logoutUser, registerUser } from "../services/auth";




export const registerController = async (req: Request, res: Response) => {
    try {
        const {email, username, password} = registerSchema.parse(req.body);
        const register = await registerUser(email, username, password);
        res.status(201).json({
            status: "success",
            register
        })
    } catch (error) {
        res.status(400).json({error: (error as Error).message})
    }
}


export const loginController = async (req: Request, res: Response) => {
    try {
        const {email, password} = loginSchema.parse(req.body);
        const login = await loginUser(email, password);
        res.status(201).json({
            status: 'Success',
            data: login
        })
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const logout = async(req: Request, res: Response) => {
    try {
        await logoutUser(req.user?.id as any);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}


