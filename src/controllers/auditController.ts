import { Request, Response, NextFunction } from 'express';
import { StudentRecord, StudentCourse } from '../models/student';
import { isGradePassing, normalizeGrade } from '../utils/gradeUtils';

import {
  getSemesterDataSvc,
} from '../services/firebaseService';

import {
  SemesterData,
  Slot,
} from '../models/curriculum';

type StudentAuditResult = {
  applicationNo: string;
  name?: string;
  program: string;
  passed: boolean;
  missing: string[];
};

const norm = (s: string) => (s || '').trim().toUpperCase();

/** 
 * Build fast lookups for a student's transcript
 * From the data coming from the frontend 
*/
function indexStudentCourses(courses: StudentCourse[]) {
  const byName = new Map<string, StudentCourse[]>();
  for (const c of courses || []) {
    const key = norm(c.code); // "Course" column was mapped to .code TODO
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(c);
  }
  return { byName };
}

//Find the best attempt for a given course name that passes >= minGrade 
function findPassingAttempt(
  byName: Map<string, StudentCourse[]>,
  courseName: string,
  minGrade: string
): StudentCourse | null {
  const arr = byName.get(norm(courseName));
  if (!arr || arr.length === 0) return null;
  for (const a of arr) {
    if (isGradePassing(normalizeGrade(a.grade), normalizeGrade(minGrade))) {
      return a;
    }
  }
  return null;
}

//Apply simple rules
function applyRules(
  data: SemesterData,
  coursesByName: Map<string, StudentCourse[]>
): { slots: Slot[]; waivedTitles: Set<string> } {
  const resultSlots: Slot[] = [...(data.slots || [])];
  const waived = new Set<string>();

  const rules = data.rules || [];
  for (const r of rules) {
    const any = r.when?.anyPassed || [];
    const all = r.when?.allPassed || [];

    const anyOk =
      any.length === 0
        ? true
        : any.some((nm) => {
            const arr = coursesByName.get(norm(nm));
            if (!arr) return false;
            return arr.some((a) => isGradePassing(normalizeGrade(a.grade), 'D'));
          });

    const allOk =
      all.length === 0
        ? true
        : all.every((nm) => {
            const arr = coursesByName.get(norm(nm));
            if (!arr) return false;
            return arr.some((a) => isGradePassing(normalizeGrade(a.grade), 'D'));
          });

    if (anyOk && allOk) {
      // Waive slots by title
      for (const t of r.then?.waiveSlotsByTitle || []) {
        waived.add(norm(t));
      }
      // Add slots
      if (Array.isArray(r.then?.addSlots)) {
        for (const s of r.then!.addSlots!) {
          // Ensure defaults until they are changed
          resultSlots.push({
            ...s,
            kind: s.kind || 'required',
            minGrade: s.minGrade || 'D',
            priority: typeof s.priority === 'number' ? s.priority : (s.kind === 'required' ? 0 : 50),
          });
        }
      }
    }
  }

  return { slots: resultSlots, waivedTitles: waived };
}

//Evaluate one student against one semester’s slots 
function evaluateStudentAgainstSlots(
  student: StudentRecord,
  semesterData: SemesterData
): StudentAuditResult {
  const missing: string[] = [];
  const { byName } = indexStudentCourses(student.courses || []);

  // transformed slots + waived titles
  const { slots, waivedTitles } = applyRules(semesterData, byName);

  const sorted = [...(slots || [])].sort((a, b) => {
    const ap = typeof a.priority === 'number' ? a.priority : (a.kind === 'required' ? 0 : 50);
    const bp = typeof b.priority === 'number' ? b.priority : (b.kind === 'required' ? 0 : 50);
    if (ap !== bp) return ap - bp;
    if (a.kind !== b.kind) return a.kind === 'required' ? -1 : 1;
    return (a.title || '').localeCompare(b.title || '');
  });

  // Track consumed course names so one course can’t satisfy two slots
  // This is very important
  const consumed = new Set<string>();

  for (const slot of sorted) {
    const title = slot.title || (slot.kind === 'required' ? slot.courseName || 'Required' : 'Elective');

    // Skip waived slots
    if (waivedTitles.has(norm(title))) continue;

    const minG = slot.minGrade || 'D';
    if (slot.kind === 'required') {
      const name = slot.courseName || '';
      if (!name) {
        missing.push(`${title}: (bad configuration: missing courseName)`);
        continue;
      }
      const key = norm(name);
      if (consumed.has(key)) continue; // already satisfied by earlier logic

      const attempt = findPassingAttempt(byName, name, minG);
      if (!attempt) {
        missing.push(`${title}: needs ${name} with ≥ ${minG}`);
      } else {
        consumed.add(key);
      }
    } else {
      // elective: must match any allowedCourses and not be consumed already
      const allowed = (slot.allowedCourses || []).map(norm);
      if (allowed.length === 0) {
        missing.push(`${title}: (bad configuration: empty allowedCourses)`);
        continue;
      }
      let satisfied = false;
      for (const nm of allowed) {
        if (consumed.has(nm)) continue;
        const arr = byName.get(nm);
        if (!arr) continue;
        const pass = arr.find((a) => isGradePassing(normalizeGrade(a.grade), normalizeGrade(minG)));
        if (pass) {
          consumed.add(nm);
          satisfied = true;
          break;
        }
      }
      if (!satisfied) {
        // show a compact list
        const sample = (slot.allowedCourses || []).join(', ');
        missing.push(`${title}: needs one of [${sample}] with ≥ ${minG}`);
      }
    }
  }

  return {
    applicationNo: student.applicationNo,
    name: student.name,
    program: student.program,
    passed: missing.length === 0,
    missing,
  };
}

/**
 * POST /api/audit/run
 * Body: { yearGroup: number, semester: 'YxSy', students: StudentRecord[] }
 */
export async function runAuditHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const yearGroup = parseInt(req.body?.yearGroup, 10);
    const semester = String(req.body?.semester || '').trim().toUpperCase();
    const students: StudentRecord[] = Array.isArray(req.body?.students) ? req.body.students : [];

    if (!Number.isFinite(yearGroup) || !semester) {
      res.status(400).json({ message: 'yearGroup and semester are required' });
      return;
    }
    if (students.length === 0) {
      res.status(400).json({ message: 'students array is required' });
      return;
    }

    // Pull semester criteria once per unique program
    const programToData = new Map<string, SemesterData>();
    const uniquePrograms = Array.from(new Set(students.map((s) => s.program || '').filter(Boolean)));

    for (const prog of uniquePrograms) {
      const data = await getSemesterDataSvc(yearGroup, prog, semester);
      programToData.set(prog, data || { slots: [], rules: [] });
    }

    // Evaluate each student
    const results: StudentAuditResult[] = [];
    for (const s of students) {
      const data = programToData.get(s.program) || { slots: [], rules: [] };
      const r = evaluateStudentAgainstSlots(s, data);
      results.push(r);
    }

    const notOnTrack = results.filter((r) => !r.passed).length;
    res.json({ total: results.length, notOnTrackCount: notOnTrack, results });
  } catch (err) {
    next(err);
  }
}
