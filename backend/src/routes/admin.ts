// src/routes/admin.ts
import { Router } from 'express';
import { 
  banUserHandler, 
  unbanUserHandler, 
  deleteMessageHandler, 
  getStatisticsHandler, 
  getAnalyticsHandler, 
  purgeUserMessagesHandler 
} from '../controllers/admin';
import { adminAccess, authenticateToken,  } from '../middlewares/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, adminAccess);

router.post('/ban/:userId', banUserHandler);
router.post('/unban/:userId', unbanUserHandler);
router.delete('/message/:messageId', deleteMessageHandler);
router.post('/purge-messages/:userId', purgeUserMessagesHandler);
router.get('/statistics', getStatisticsHandler);
router.get('/analytics', getAnalyticsHandler);

export default router;