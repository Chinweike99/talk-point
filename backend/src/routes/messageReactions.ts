import { Router } from 'express';
import { 
  addReactionHandler, 
  removeReactionHandler, 
  getReactionsHandler 
} from '../controllers/messageReactions.js';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.post('/:messageId/reactions', addReactionHandler);
router.delete('/:messageId/reactions', removeReactionHandler);
router.get('/:messageId/reactions', getReactionsHandler);

export default router;