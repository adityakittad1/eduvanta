"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAllStudents = exports.evaluateStudent = void 0;
const prisma_1 = require("../../lib/prisma");
const logger_1 = require("../../lib/logger");
const ATTENDANCE_THRESHOLD = 75; // below 75% triggers a warning
const ACADEMICS_THRESHOLD = 40; // below 40% average triggers a warning
async function evaluateStudent(studentId, schoolId) {
    // 1. Evaluate Attendance
    const attendanceRecords = await prisma_1.prisma.attendanceRecord.findMany({
        where: { studentId, schoolId, status: { in: ['PRESENT', 'ABSENT', 'LATE'] } }
    });
    let totalDays = 0;
    let presentDays = 0;
    attendanceRecords.forEach(r => {
        totalDays++;
        if (r.status === 'PRESENT' || r.status === 'LATE')
            presentDays++;
    });
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : null;
    await manageFlag(schoolId, studentId, 'LOW_ATTENDANCE', attendancePercentage !== null && attendancePercentage < ATTENDANCE_THRESHOLD, { threshold: ATTENDANCE_THRESHOLD, actual: attendancePercentage ? Math.round(attendancePercentage) : 0 });
    // 2. Evaluate Academics
    const academicRecords = await prisma_1.prisma.academicRecord.findMany({
        where: { studentId, schoolId },
        include: { assessment: true }
    });
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    academicRecords.forEach(r => {
        totalMarksObtained += r.marksObtained;
        totalMaxMarks += r.assessment.maxMarks;
    });
    const academicPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : null;
    await manageFlag(schoolId, studentId, 'LOW_ACADEMIC_PERFORMANCE', academicPercentage !== null && academicPercentage < ACADEMICS_THRESHOLD, { threshold: ACADEMICS_THRESHOLD, actual: academicPercentage ? Math.round(academicPercentage) : 0 });
}
exports.evaluateStudent = evaluateStudent;
async function manageFlag(schoolId, studentId, flagType, shouldFlag, details) {
    // Find existing active flag
    const existingFlag = await prisma_1.prisma.earlyWarningFlag.findFirst({
        where: { schoolId, studentId, flagType, isResolved: false }
    });
    if (shouldFlag) {
        if (!existingFlag) {
            // Create new flag
            await prisma_1.prisma.earlyWarningFlag.create({
                data: {
                    schoolId,
                    studentId,
                    flagType,
                    details
                }
            });
            logger_1.logger.info(`Generated ${flagType} flag for student ${studentId}`);
        }
        else {
            // Update details if necessary (optional, but good for keeping the actual % up to date)
            await prisma_1.prisma.earlyWarningFlag.update({
                where: { id: existingFlag.id },
                data: { details }
            });
        }
    }
    else {
        // If flag is active but condition is no longer met, resolve it
        if (existingFlag) {
            await prisma_1.prisma.earlyWarningFlag.update({
                where: { id: existingFlag.id },
                data: {
                    isResolved: true,
                    resolvedAt: new Date(),
                    details: { ...existingFlag.details, finalActual: details.actual, note: "Automatically resolved" }
                }
            });
            logger_1.logger.info(`Resolved ${flagType} flag for student ${studentId}`);
        }
    }
}
async function evaluateAllStudents(schoolId, classId) {
    const students = await prisma_1.prisma.student.findMany({
        where: {
            schoolId,
            isActive: true,
            ...(classId && { classId })
        },
        select: { id: true }
    });
    let evaluatedCount = 0;
    for (const student of students) {
        await evaluateStudent(student.id, schoolId);
        evaluatedCount++;
    }
    return evaluatedCount;
}
exports.evaluateAllStudents = evaluateAllStudents;
//# sourceMappingURL=early-warning.service.js.map