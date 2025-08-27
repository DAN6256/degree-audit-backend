import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { runAuditHandler } from '../controllers/auditController';

const router = Router();

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
router.post('/run', authenticateToken, runAuditHandler);

export default router;