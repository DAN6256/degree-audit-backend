"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
