import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
const router = Router();

router.use(authenticate);
router.get('/', authorize('OWNER', 'HQ_ADMIN'), (req, res) => res.json({ users: [] }));

export default router;
