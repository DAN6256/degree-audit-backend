
export interface CourseRequirement {
  code: string;
  name?: string;
  minGrade?: string;
}

/**
 * Defines a sub‑category of requirements within a category.  Subcategories may
 * specify a list of courses that must be taken (requiredCourses) or a list of
 * allowed courses that can satisfy elective requirements.  Credit and course
 * minimums can be used to enforce a minimum number of credits or courses taken.
 */
export interface SubCategoryRequirement {
  name: string;
  requiredCourses?: CourseRequirement[];
  allowedCourses?: string[];
  minCredits?: number;
  minCourses?: number;

  /**
   * Minimum letter grade required for courses in this subcategory to count towards
   * graduation. If omitted, the criteria's passGradeDefault is used.
   */
  passGrade?: string;
}

export interface CategoryRequirement {
  name: string;
  subcategories: SubCategoryRequirement[];
  minCredits?: number;
}

/**
 * Represents the full set of degree requirements for a given major, year and
 * semester.  Additional custom properties such as a default passing grade may
 * be included at the top level.
 */


  
export interface Criteria {
  major: string;
  cohort: number;                 // Not really used by frontend but do not touch
  year: number;
  semester: string;
  checkpointLabel?: string;       // Do not touch this though not actively in use
  categories: CategoryRequirement[];
  passGradeDefault?: string;
  
  /**
   * Conditional course groups specify prerequisite chains beyond simple required
   * courses.  If a student has taken any trigger course in a group, then all
   * listed required courses must also be completed and passed.  This enables
   * requirements such as: “If a student takes Pre‑calculus I, then they must
   * subsequently take Pre‑calculus II and Applied Calculus.”
   */
  conditionalGroups?: ConditionalGroup[]; //Yet tho figure this out
}

/**
 * Defines a conditional group of courses.  If a student takes any of the
 * triggerCourses then the courses listed in requiredCourses must also be
 * completed with at least the specified pass grade (or the criteria’s
 * default pass grade if not set).
 */
export interface ConditionalGroup {
  triggerCourses: string[];
  requiredCourses: CourseRequirement[];
  passGrade?: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     CourseRequirement:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Course code (e.g. CS101)
 *         name:
 *           type: string
 *           description: Optional course title
 *         minGrade:
 *           type: string
 *           description: Minimum grade letter required to count this course
 *       required:
 *         - code
 *     SubCategoryRequirement:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         requiredCourses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CourseRequirement'
 *         allowedCourses:
 *           type: array
 *           items:
 *             type: string
 *         minCredits:
 *           type: number
 *           description: Minimum credits required from the allowed courses
 *         minCourses:
 *           type: number
 *           description: Minimum number of courses required from the allowed courses
 *         passGrade:
 *           type: string
 *           description: Minimum letter grade required for courses in this subcategory
 *       required:
 *         - name
 *     CategoryRequirement:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         subcategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubCategoryRequirement'
 *         minCredits:
 *           type: number
 *           description: Optional minimum credits for the entire category
 *       required:
 *         - name
 *         - subcategories
 *
 *     ConditionalGroup:
 *       type: object
 *       properties:
 *         triggerCourses:
 *           type: array
 *           items:
 *             type: string
 *           description: List of course codes that trigger this conditional group
 *         requiredCourses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CourseRequirement'
 *           description: Courses that must be completed if any trigger course is taken
 *         passGrade:
 *           type: string
 *           description: Optional pass grade override for this group
 *       required:
 *         - triggerCourses
 *         - requiredCourses
 *     Criteria:
 *       type: object
 *       properties:
 *         major:
 *           type: string
 *           description: Program/major name
 *         year:
 *           type: integer
 *           description: Academic year (1-4)
 *         semester:
 *           type: string
 *           description: Semester (e.g. "Fall", "Spring")
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryRequirement'
 *         passGradeDefault:
 *           type: string
 *           description: Optional default passing grade letter used when a course requirement doesn’t specify a minGrade
 *         conditionalGroups:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConditionalGroup'
 *           description: Additional conditional course requirements
 *       required:
 *         - major
 *         - year
 *         - semester
 *         - categories
 */