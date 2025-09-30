// src/routes/auth.ts
import { Router } from 'express';
import {  loginController, logout, registerController } from '../controllers/auth';
import { authenticateToken } from '../middlewares/auth.js';
// import { authenticateToken } from '../middlewares/auth';
// import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', authenticateToken, logout);

export default router;