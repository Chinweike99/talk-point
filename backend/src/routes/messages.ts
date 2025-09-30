import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import { getConversationsHandler, getDirectMessagesHandler, getRoomMessagesHandler, markAsReadHandler, sendMessageHandler } from "../controllers/messages";

const router = Router();

router.post('/', authenticateToken, upload.single('image'), sendMessageHandler);
router.get('/conversations', authenticateToken, getConversationsHandler);
router.get('/room/:roomId', authenticateToken, getRoomMessagesHandler);
router.get('/direct/:userId', authenticateToken, getDirectMessagesHandler);
router.post('/mark-read', authenticateToken, markAsReadHandler);

export default router;