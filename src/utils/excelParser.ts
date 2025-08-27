import * as xlsx from 'xlsx';
import { StudentRecord, StudentCourse } from '../models/student';
//Not used. I started with that but if it works do not touch
export function parseStudents(fileBuffer: Buffer): StudentRecord[] {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: null });

  const studentsMap: Record<string, StudentRecord> = {};
  for (const row of rows) {
    const appNo = row['Application No'] ? String(row['Application No']).trim() : undefined;
    const name = row['Name'] ? String(row['Name']).trim() : undefined;
    const program = row['Program'] ? String(row['Program']).trim() : undefined;
    const courseCode = row['Course'] ? String(row['Course']).trim() : undefined;
    const category = row['Category'] ? String(row['Category']).trim() : undefined;
    const subCategory = row['Sub-Category'] ? String(row['Sub-Category']).trim() : undefined;
    const courseCreditsRaw = row['Course Credits'];
    const courseCredits = typeof courseCreditsRaw === 'number' ? courseCreditsRaw : parseFloat(courseCreditsRaw);
    const earnedCreditsRaw = row['Student Earned Credits'];
    const earnedCredits = typeof earnedCreditsRaw === 'number' ? earnedCreditsRaw : parseFloat(earnedCreditsRaw);
    const grade = row['Grade'] ? String(row['Grade']).trim() : '';

    if (!appNo || !courseCode) {
      continue;
    }
    if (!studentsMap[appNo]) {
      studentsMap[appNo] = {
        applicationNo: appNo,
        name: name || '',
        program: program || '',
        courses: [],
      };
    }
    const course: StudentCourse = {
      code: courseCode,
      category: category || '',
      subCategory: subCategory || '',
      credits: Number.isNaN(courseCredits) ? 0 : courseCredits,
      earnedCredits: Number.isNaN(earnedCredits) ? 0 : earnedCredits,
      grade: grade,
    };
    studentsMap[appNo].courses.push(course);
  }
  return Object.values(studentsMap);
}