"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
