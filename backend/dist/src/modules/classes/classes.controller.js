"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignStudents = exports.assignTeacher = exports.createSubject = exports.createClass = exports.getClassById = exports.getClasses = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const dataDb_1 = require("../../lib/dataDb");
async function getClasses(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const classes = await (0, dataDb_1.dbGetClasses)(schoolId);
        res.json({ success: true, data: classes });
    }
    catch (error) {
        next(error);
    }
}
exports.getClasses = getClasses;
async function getClassById(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const classRecord = await (0, dataDb_1.dbGetClassById)(classId, schoolId);
        if (!classRecord) {
            throw new errorHandler_1.AppError('Class not found', 404, 'NOT_FOUND');
        }
        res.json({ success: true, data: classRecord });
    }
    catch (error) {
        next(error);
    }
}
exports.getClassById = getClassById;
async function createClass(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const existingClass = await prisma_1.prisma.class.findFirst({
            where: {
                schoolId,
                name: data.name,
                division: data.division || null,
                academicYear: data.academicYear
            }
        });
        if (existingClass) {
            throw new errorHandler_1.AppError('This class/division already exists for this academic year', 400, 'BAD_REQUEST');
        }
        const newClass = await prisma_1.prisma.class.create({
            data: {
                schoolId,
                name: data.name,
                division: data.division || null,
                academicYear: data.academicYear,
            }
        });
        res.status(201).json({ success: true, data: newClass });
    }
    catch (error) {
        next(error);
    }
}
exports.createClass = createClass;
async function createSubject(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        // Verify class exists
        const classRecord = await prisma_1.prisma.class.findUnique({ where: { id: classId } });
        if (!classRecord || classRecord.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Class not found', 404, 'NOT_FOUND');
        }
        const existingSubject = await prisma_1.prisma.subject.findFirst({
            where: { schoolId, classId, name: data.name }
        });
        if (existingSubject) {
            throw new errorHandler_1.AppError('Subject with this name already exists in this class', 400, 'BAD_REQUEST');
        }
        const subject = await prisma_1.prisma.subject.create({
            data: {
                schoolId,
                classId,
                name: data.name,
                code: data.code || null,
            }
        });
        res.status(201).json({ success: true, data: subject });
    }
    catch (error) {
        next(error);
    }
}
exports.createSubject = createSubject;
async function assignTeacher(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        // Check if mapping already exists, if so update it, else create
        const existingMapping = await prisma_1.prisma.teacherClassSubject.findFirst({
            where: {
                schoolId,
                classId,
                subjectId: data.subjectId,
                academicYear: data.academicYear
            }
        });
        let assignment;
        if (existingMapping) {
            // Update the assigned teacher
            assignment = await prisma_1.prisma.teacherClassSubject.update({
                where: { id: existingMapping.id },
                data: { teacherId: data.teacherId }
            });
        }
        else {
            assignment = await prisma_1.prisma.teacherClassSubject.create({
                data: {
                    schoolId,
                    classId,
                    subjectId: data.subjectId,
                    teacherId: data.teacherId,
                    academicYear: data.academicYear
                }
            });
        }
        res.json({ success: true, data: assignment });
    }
    catch (error) {
        next(error);
    }
}
exports.assignTeacher = assignTeacher;
async function assignStudents(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        // Verify class exists
        const classRecord = await prisma_1.prisma.class.findUnique({ where: { id: classId } });
        if (!classRecord || classRecord.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Class not found', 404, 'NOT_FOUND');
        }
        // Update students in bulk
        const updateResult = await prisma_1.prisma.student.updateMany({
            where: {
                id: { in: data.studentIds },
                schoolId // Security check
            },
            data: {
                classId
            }
        });
        res.json({ success: true, message: `Successfully assigned ${updateResult.count} students to this class.` });
    }
    catch (error) {
        next(error);
    }
}
exports.assignStudents = assignStudents;
//# sourceMappingURL=classes.controller.js.map