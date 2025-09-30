import { Request } from "express";
import multer from "multer";
import path from "path";
import prisma from "../config/database";
import { sendToQueue } from "../services/rabbitmq";


const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});
// eslint-disable-next-line no-undef
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new Error('Only image files are allowed'))
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        files: 5 * 1024 * 1024
    }
});

