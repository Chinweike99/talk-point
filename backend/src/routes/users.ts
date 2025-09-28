import { Router } from 'express';
import { getUsers, getUserProfile, getMyProfile, getAdmin } from '../controllers/users';
import { authenticateToken } from '../middlewares/auth.js';
// import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getUsers); 
router.get('/admin', authenticateToken, getAdmin);
router.get('/me', authenticateToken, getMyProfile);
router.get('/:id', authenticateToken, getUserProfile);

export default router;