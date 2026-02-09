import { Router } from 'express';
import { authenticate } from '../middleware/auth';
const router = Router();

router.use(authenticate);
router.get('/', (req, res) => res.json({ message: 'sync routes' }));

export default router;
