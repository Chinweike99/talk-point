import { Router } from 'express';
import { 
  getNotificationsHandler, 
  markAsReadHandler, 
  markAllAsReadHandler, 
  deleteNotificationHandler 
} from '../controllers/notifications';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotificationsHandler);
router.put('/:notificationId/read', markAsReadHandler);
router.put('/read-all', markAllAsReadHandler);
router.delete('/:notificationId', deleteNotificationHandler);

export default router;