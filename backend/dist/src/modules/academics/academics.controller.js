"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAcademics = exports.getMarksForAssessment = exports.saveMarks = exports.getAssessmentById = exports.getAssessments = exports.createAssessment = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function createAssessment(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const assessment = await prisma_1.prisma.assessment.create({
            data: {
                schoolId,
                classId: data.classId,
                subjectId: data.subjectId,
                name: data.name,
                type: data.type,
                maxMarks: data.maxMarks,
                conductedDate: data.conductedDate ? new Date(data.conductedDate) : null,
                academicYear: data.academicYear
            }
        });
        res.status(201).json({ success: true, data: assessment });
    }
    catch (error) {
        next(error);
    }
}
exports.createAssessment = createAssessment;
async function getAssessments(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.query.classId;
        const subjectId = req.query.subjectId;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const assessments = await prisma_1.prisma.assessment.findMany({
            where: {
                schoolId,
                ...(classId && { classId }),
                ...(subjectId && { subjectId })
            },
            include: {
                class: { select: { name: true, division: true } },
                subject: { select: { name: true } },
                _count: { select: { academicRecords: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: assessments });
    }
    catch (error) {
        next(error);
    }
}
exports.getAssessments = getAssessments;
async function getAssessmentById(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const assessmentId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const assessment = await prisma_1.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: {
                class: { select: { name: true, division: true } },
                subject: { select: { name: true } }
            }
        });
        if (!assessment || assessment.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Assessment not found', 404, 'NOT_FOUND');
        }
        res.json({ success: true, data: assessment });
    }
    catch (error) {
        next(error);
    }
}
exports.getAssessmentById = getAssessmentById;
async function saveMarks(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const assessmentId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { records } = req.body;
        const assessment = await prisma_1.prisma.assessment.findUnique({ where: { id: assessmentId } });
        if (!assessment || assessment.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Assessment not found', 404, 'NOT_FOUND');
        }
        const upserts = records.map(record => {
            // Basic validation
            if (record.marksObtained > assessment.maxMarks) {
                throw new errorHandler_1.AppError(`Marks obtained cannot exceed max marks for student ${record.studentId}`, 400, 'BAD_REQUEST');
            }
            return prisma_1.prisma.academicRecord.upsert({
                where: {
                    studentId_assessmentId: {
                        studentId: record.studentId,
                        assessmentId: assessmentId
                    }
                },
                update: {
                    marksObtained: record.marksObtained,
                    remarks: record.remarks || null
                },
                create: {
                    schoolId,
                    studentId: record.studentId,
                    assessmentId: assessmentId,
                    marksObtained: record.marksObtained,
                    remarks: record.remarks || null
                }
            });
        });
        await prisma_1.prisma.$transaction(upserts);
        res.json({ success: true, message: `Successfully saved marks for ${records.length} students` });
    }
    catch (error) {
        next(error);
    }
}
exports.saveMarks = saveMarks;
async function getMarksForAssessment(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const assessmentId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const marks = await prisma_1.prisma.academicRecord.findMany({
            where: {
                schoolId,
                assessmentId
            }
        });
        res.json({ success: true, data: marks });
    }
    catch (error) {
        next(error);
    }
}
exports.getMarksForAssessment = getMarksForAssessment;
async function getStudentAcademics(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const studentId = req.params.studentId;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        if (req.user?.role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { id: studentId } });
            if (student?.userId !== req.user.id) {
                throw new errorHandler_1.AppError('Forbidden', 403, 'FORBIDDEN');
            }
        }
        const records = await prisma_1.prisma.academicRecord.findMany({
            where: { schoolId, studentId },
            include: {
                assessment: {
                    include: { subject: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        let totalMarksObtained = 0;
        let totalMaxMarks = 0;
        records.forEach(r => {
            totalMarksObtained += r.marksObtained;
            totalMaxMarks += r.assessment.maxMarks;
        });
        const averagePercentage = totalMaxMarks > 0
            ? Math.round((totalMarksObtained / totalMaxMarks) * 100)
            : null;
        res.json({
            success: true,
            data: {
                averagePercentage,
                records
            }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getStudentAcademics = getStudentAcademics;
//# sourceMappingURL=academics.controller.js.map