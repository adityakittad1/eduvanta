"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEvaluation = exports.getFlags = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const early_warning_service_1 = require("./early-warning.service");
async function getFlags(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.query.classId;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const flags = await prisma_1.prisma.earlyWarningFlag.findMany({
            where: {
                schoolId,
                isResolved: false,
                ...(classId && { student: { classId } })
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNumber: true,
                        class: { select: { name: true, division: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: flags });
    }
    catch (error) {
        next(error);
    }
}
exports.getFlags = getFlags;
async function runEvaluation(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { classId } = req.body;
        const evaluatedCount = await (0, early_warning_service_1.evaluateAllStudents)(schoolId, classId);
        res.json({
            success: true,
            message: `Successfully evaluated ${evaluatedCount} students.`,
            data: { evaluatedCount }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.runEvaluation = runEvaluation;
//# sourceMappingURL=early-warning.controller.js.map