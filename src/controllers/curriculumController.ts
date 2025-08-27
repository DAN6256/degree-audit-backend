import { Request, Response } from 'express';
import {
  listYearGroupsSvc,
  upsertYearGroupSvc,
  listProgramsSvc,
  upsertProgramSvc,
} from '../services/firebaseService';

import { ProgramMeta } from '../models/curriculum';

export async function listYearGroups(_req: Request, res: Response) {
  const arr = await listYearGroupsSvc();
  res.json(arr.map((y) => ({ yearGroup: y, programs: [] })));
}

export async function upsertYearGroup(req: Request, res: Response) {
  const { yearGroup } = req.body || {};
  const yg = parseInt(yearGroup, 10);
  if (!Number.isFinite(yg)) {
    res.status(400).json({ message: 'yearGroup required' });
    return;
  }
  await upsertYearGroupSvc(yg);
  res.json({ ok: true });
}

export async function listPrograms(req: Request, res: Response) {
  const yg = parseInt(req.params.yearGroup, 10);
  if (!Number.isFinite(yg)) {
    res.status(400).json({ message: 'bad yearGroup' });
    return;
  }
  const progs = await listProgramsSvc(yg);
  res.json(progs);
}

export async function upsertProgram(req: Request, res: Response) {
  const yg = parseInt(req.params.yearGroup, 10);
  if (!Number.isFinite(yg)) {
    res.status(400).json({ message: 'bad yearGroup' });
    return;
  }
  const meta = req.body as ProgramMeta;
  if (!meta?.displayName) {
    res.status(400).json({ message: 'displayName required' });
    return;
  }
  await upsertProgramSvc(yg, meta);
  res.json({ ok: true });
}
