import { Request, Response, NextFunction } from 'express';
import { Criteria } from '../models/criteria';

import {
  getCriteria as fetchCriteria,
  saveCriteria,
  deleteCriteria as removeCriteria,
  getSemesterDataSvc,
  saveSemesterDataSvc,
} from '../services/firebaseService';



export async function getCriteriaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { major, year, semester } = req.params;
    const yearNum = parseInt(year, 10);
    if (!major || Number.isNaN(yearNum) || !semester) {
      res.status(400).json({ message: 'Missing or invalid parameters' });
      return;
    }
    const criteria = await fetchCriteria(major, yearNum, semester);
    if (!criteria) {
      res.status(404).json({ message: 'Criteria not found' });
      return;
    }
    res.status(200).json(criteria);
  } catch (err) {
    next(err);
  }
}


export async function createOrUpdateCriteriaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const criteria = req.body as Criteria;
    if (!criteria?.major || !criteria?.year || !criteria?.semester) {
      res.status(400).json({ message: 'Invalid criteria payload' });
      return;
    }
    await saveCriteria(criteria);
    res.status(200).json({ message: 'Criteria saved successfully' });
  } catch (err) {
    next(err);
  }
}


export async function deleteCriteriaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { major, year, semester } = req.params;
    const yearNum = parseInt(year, 10);
    if (!major || Number.isNaN(yearNum) || !semester) {
      res.status(400).json({ message: 'Missing or invalid parameters' });
      return;
    }
    await removeCriteria(major, yearNum, semester);
    res.status(200).json({ message: 'Criteria removed' });
  } catch (err) {
    next(err);
  }
}


export async function getSemesterByYearGroupProgramSemester(req: Request, res: Response, next: NextFunction) {
  try {
    const yearGroup = parseInt(req.params.yearGroup, 10);
    const program = decodeURIComponent(req.params.program || '');
    const semester = decodeURIComponent(req.params.semester || '');
    if (!Number.isFinite(yearGroup) || !program || !semester) {
      res.status(400).json({ message: 'yearGroup, program, semester are required' });
      return;
    }
    const data = await getSemesterDataSvc(yearGroup, program, semester);
    res.json(data || { slots: [], rules: [] });
  } catch (err) {
    next(err);
  }
}


export async function saveSemesterByYearGroupProgramSemester(req: Request, res: Response, next: NextFunction) {
  try {
    const yearGroup = parseInt(req.params.yearGroup, 10);
    const program = decodeURIComponent(req.params.program || '');
    const semester = decodeURIComponent(req.params.semester || '');
    if (!Number.isFinite(yearGroup) || !program || !semester) {
      res.status(400).json({ message: 'yearGroup, program, semester are required' });
      return;
    }
    await saveSemesterDataSvc(yearGroup, program, semester, req.body || { slots: [], rules: [] });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
