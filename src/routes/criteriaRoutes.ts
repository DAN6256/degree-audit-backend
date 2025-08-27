import { Router, Request, Response } from 'express';
import { getSemesterData, saveSemesterData } from '../services/curriculumService';

const router = Router();

router.get('/:yearGroup/:program/:semester', async (req: Request, res: Response) => {
  try {
    const yearGroup = parseInt(req.params.yearGroup, 10);
    const programRaw = decodeURIComponent(req.params.program || '');
    const semester = req.params.semester;

    if (!Number.isFinite(yearGroup) || !programRaw || !semester) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }
    const data = await getSemesterData(yearGroup, programRaw, semester);
    return res.json(data || { slots: [], rules: [] });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' });
  }
});

router.post('/:yearGroup/:program/:semester', async (req: Request, res: Response) => {
  try {
    const yearGroup = parseInt(req.params.yearGroup, 10);
    const programRaw = decodeURIComponent(req.params.program || '');
    const semester = req.params.semester;

    if (!Number.isFinite(yearGroup) || !programRaw || !semester) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    await saveSemesterData(yearGroup, programRaw, semester, req.body);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' });
  }
});

export default router;
