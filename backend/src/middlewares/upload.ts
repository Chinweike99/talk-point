import { Request } from "express";
import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if(file.mimetype.startsWith('/image')){
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

