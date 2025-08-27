import { SemesterData, Slot, Rule } from '../models/curriculum';
import {
  getSemesterDataSvc,
  saveSemesterDataSvc,
} from './firebaseService';

export function sanitizeProgramKey(input: string): string {
  return (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')   // collapse any run of non-alphanum to underscore
    .replace(/^_+|_+$/g, '');      // trim leading/trailing underscores
}


function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj as any)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out;
  }
  return obj;
}

function sanitizeSlot(s: any): Slot {
  const base: Slot = {
    id: String(s?.id || ''),
    title: String(s?.title || ''),
    kind: s?.kind === 'elective' ? 'elective' : 'required',
    minGrade: s?.minGrade ? String(s.minGrade) : 'D',
    priority: Number.isFinite(Number(s?.priority)) ? Number(s.priority) : (s?.kind === 'required' ? 0 : 50),
    tag: s?.tag ? String(s.tag) : undefined,
  };

  if (base.kind === 'required') {
    return stripUndefined({
      ...base,
      courseName: String(s?.courseName || ''),
    });
  } else {
    const arr = Array.isArray(s?.allowedCourses) ? s.allowedCourses : [];
    return stripUndefined({
      ...base,
      allowedCourses: arr.map((x: any) => String(x)).filter(Boolean),
    });
  }
}

function sanitizeRule(r: any): Rule {
  const when = r?.when || {};
  const then = r?.then || {};
  return stripUndefined({
    id: String(r?.id || ''),
    name: String(r?.name || ''),
    when: {
      anyPassed: Array.isArray(when.anyPassed) ? when.anyPassed.map((x: any) => String(x)).filter(Boolean) : undefined,
      allPassed: Array.isArray(when.allPassed) ? when.allPassed.map((x: any) => String(x)).filter(Boolean) : undefined,
    },
    then: {
      waiveSlotsByTitle: Array.isArray(then.waiveSlotsByTitle)
        ? then.waiveSlotsByTitle.map((x: any) => String(x)).filter(Boolean)
        : undefined,
      waiveCourses: Array.isArray(then.waiveCourses)
        ? then.waiveCourses.map((x: any) => String(x)).filter(Boolean)
        : undefined,
      addSlots: Array.isArray(then.addSlots)
        ? then.addSlots.map(sanitizeSlot)
        : undefined,
    },
  });
}

function sanitizeSemesterData(data: any): SemesterData {
  const slots = Array.isArray(data?.slots) ? data.slots.map(sanitizeSlot) : [];
  const rules = Array.isArray(data?.rules) ? data.rules.map(sanitizeRule) : [];
  return stripUndefined({ slots, rules });
}


export async function getSemesterData(
  yearGroup: number,
  programLabel: string,
  semester: string
): Promise<SemesterData | null> {
  const programKey = sanitizeProgramKey(programLabel);
  const d = await getSemesterDataSvc(yearGroup, programKey, semester);
  return d ? sanitizeSemesterData(d) : { slots: [], rules: [] };
}


export async function saveSemesterData(
  yearGroup: number,
  programLabel: string,
  semester: string,
  payload: SemesterData
): Promise<void> {
  const programKey = sanitizeProgramKey(programLabel);
  const clean = sanitizeSemesterData(payload);
  await saveSemesterDataSvc(yearGroup, programKey, semester, clean);
}
