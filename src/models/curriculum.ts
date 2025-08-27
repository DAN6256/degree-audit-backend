export type Grade = 'A+'|'A'|'B+'|'B'|'C+'|'C'|'D+'|'D'|'E'|'P'|string;
export type SlotKind = 'required'|'elective';

export interface Slot {
  id: string;
  title: string;
  kind: SlotKind;
  courseName?: string;        // for required
  allowedCourses?: string[];  // for elective
  minGrade?: Grade;
  priority?: number;
  tag?: string;
}

export interface Rule {
  id: string;
  name: string;
  when?: { anyPassed?: string[]; allPassed?: string[] };
  then?: { addSlots?: Slot[]; waiveSlotsByTitle?: string[]; waiveCourses?: string[] };
}

export interface SemesterData {
  slots: Slot[];
  rules: Rule[];
  checkpointLabel?: string;   // optional; not required by frontend
}

export interface ProgramMeta {
  displayName: string;
  defaultPassGrade?: Grade;
}
