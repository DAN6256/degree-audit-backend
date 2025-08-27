"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auditController_1 = require("../controllers/auditController");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/audit/run:
 *   post:
 *     summary: Run a degree audit on provided student data.
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               semester:
 *                 type: string
 *               students:
 *                 type: array
 *                 description: List of student records to audit
 *                 items:
 *                   $ref: '#/components/schemas/StudentRecord'
 *             required:
 *               - year
 *               - semester
 *               - students
 *     responses:
 *       200:
 *         description: Returns audit results for each student
 */
router.post('/run', auth_1.authenticateToken, auditController_1.runAuditHandler);
exports.default = router;
