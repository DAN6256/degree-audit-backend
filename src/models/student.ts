
export interface StudentCourse {
  code: string; //The course code, e.g. CS101
  category: string;
  subCategory: string;
  credits: number;
  earnedCredits: number;
  grade: string;
}

/**
 * Represents a student record extracted from the uploaded spreadsheet.  Each
 * record contains the student's unique identifiers and a list of courses.
 */
export interface StudentRecord {
  applicationNo: string;
  name: string;
  program: string;
  courses: StudentCourse[];
}

/**
 * @openapi
 * components:
 *   schemas:
 *     StudentCourse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         category:
 *           type: string
 *         subCategory:
 *           type: string
 *         credits:
 *           type: number
 *         earnedCredits:
 *           type: number
 *         grade:
 *           type: string
 *       required:
 *         - code
 *     StudentRecord:
 *       type: object
 *       properties:
 *         applicationNo:
 *           type: string
 *         name:
 *           type: string
 *         program:
 *           type: string
 *         courses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StudentCourse'
 *       required:
 *         - applicationNo
 *         - program
 *         - courses
 */