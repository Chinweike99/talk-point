import { NextFunction,  Request,  Response } from "express";
import { verifyToken } from "../utils/helpers";




export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if(!token){
            return res.status(401).json({error: "Access token required"})
        };

        const decoded = verifyToken(token);
        if(!decoded){
            return res.status(403).json({error: "Invalid or expired token"})
        };

        req.user = decoded;
        next();

    } catch (error) {
        // throw new Error("Unable to Authenticate token")
        return error
    }
};


export const adminAccess = (req: Request, res: Response, next: NextFunction) => {
    try {
        if(req.user?.role  !== "ADMIN"){
            res.status(403).json({
                error: "Admin access is required"
            })
        }
        next();
    } catch (error) {
        throw Error("Only Admin can access this route")
    }
}

