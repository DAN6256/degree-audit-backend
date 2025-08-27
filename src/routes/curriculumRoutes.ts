import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  listYearGroups,
  upsertYearGroup,
  listPrograms,
  upsertProgram,
} from '../controllers/curriculumController';

const router = Router();

router.get('/year-groups', authenticateToken, listYearGroups);
router.post('/year-groups', authenticateToken, upsertYearGroup);

router.get('/programs/:yearGroup', authenticateToken, listPrograms);
router.post('/programs/:yearGroup', authenticateToken, upsertProgram);

export default router;
