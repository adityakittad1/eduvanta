"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAttendance = exports.getDailyAttendance = exports.markAttendance = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function markAttendance(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { classId, date, records } = req.body;
        const attendanceDate = new Date(date);
        // Verify class exists and belongs to school
        const classRecord = await prisma_1.prisma.class.findUnique({ where: { id: classId } });
        if (!classRecord || classRecord.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Class not found', 404, 'NOT_FOUND');
        }
        // Verify teacher authorization
        // In a strict setup, we would check if req.user.role === 'TEACHER' implies they are assigned to this class.
        // For now, we allow Principals and any Teacher in the school to mark attendance for simplicity.
        // Run bulk upsert in a transaction
        const upserts = records.map(record => prisma_1.prisma.attendanceRecord.upsert({
            where: {
                schoolId_classId_studentId_date: {
                    schoolId,
                    classId,
                    studentId: record.studentId,
                    date: attendanceDate
                }
            },
            update: {
                status: record.status
            },
            create: {
                schoolId,
                studentId: record.studentId,
                classId,
                date: attendanceDate,
                status: record.status
            }
        }));
        await prisma_1.prisma.$transaction(upserts);
        res.json({ success: true, message: `Successfully marked attendance for ${records.length} students` });
    }
    catch (error) {
        next(error);
    }
}
exports.markAttendance = markAttendance;
async function getDailyAttendance(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.query.classId;
        const dateStr = req.query.date;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        if (!classId || !dateStr)
            throw new errorHandler_1.AppError('classId and date are required query parameters', 400, 'BAD_REQUEST');
        const attendanceDate = new Date(dateStr);
        const records = await prisma_1.prisma.attendanceRecord.findMany({
            where: {
                schoolId,
                classId,
                date: attendanceDate
            }
        });
        res.json({ success: true, data: records });
    }
    catch (error) {
        next(error);
    }
}
exports.getDailyAttendance = getDailyAttendance;
async function getStudentAttendance(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const studentId = req.params.studentId;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        // Security: Student can only view their own, Teacher/Principal can view anyone in their school
        if (req.user?.role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { id: studentId } });
            if (student?.userId !== req.user.id) {
                throw new errorHandler_1.AppError('Forbidden', 403, 'FORBIDDEN');
            }
        }
        // Get all records for this student
        const records = await prisma_1.prisma.attendanceRecord.findMany({
            where: { schoolId, studentId },
            orderBy: { date: 'desc' }
        });
        const totalDays = records.length;
        const presentDays = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
        const holidays = records.filter(r => r.status === 'HOLIDAY').length;
        // Percentage usually excludes holidays, or counts them neutrally. 
        // Let's exclude holidays from total for percentage calculation.
        const workingDays = totalDays - holidays;
        const percentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 100;
        res.json({
            success: true,
            data: {
                stats: {
                    totalDays: workingDays,
                    presentDays,
                    absentDays: records.filter(r => r.status === 'ABSENT').length,
                    holidays,
                    percentage
                },
                history: records.slice(0, 30) // Return last 30 days for history view
            }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getStudentAttendance = getStudentAttendance;
//# sourceMappingURL=attendance.controller.js.map