import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { addToRoom, createRoomController, getMyRoomsHandler, getRoom, getRooms, joinRoomHandler, leaveRoomHandler } from '../controllers/rooms';
const router = Router();

router.post('/', authenticateToken, createRoomController);
router.get('/', authenticateToken, getRooms);
router.get('/my-rooms', authenticateToken, getMyRoomsHandler);
router.get('/:id', authenticateToken, getRoom);
router.post('/:id/join', authenticateToken, joinRoomHandler);
router.post('/:id/add-user', authenticateToken, addToRoom);
router.post('/:id/leave', authenticateToken, leaveRoomHandler);

export default router;