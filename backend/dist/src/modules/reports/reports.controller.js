"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getDashboardStats(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        // Aggregate some basic stats for reports
        const studentCount = await prisma_1.prisma.student.count({ where: { schoolId } });
        const teacherCount = await prisma_1.prisma.teacher.count({ where: { schoolId } });
        const classCount = await prisma_1.prisma.class.count({ where: { schoolId } });
        const warningCount = await prisma_1.prisma.earlyWarningFlag.count({ where: { schoolId, isResolved: false } });
        res.json({
            success: true,
            data: { studentCount, teacherCount, classCount, warningCount }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=reports.controller.js.map