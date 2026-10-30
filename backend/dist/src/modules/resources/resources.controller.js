"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResource = exports.getResources = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getResources(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const role = req.user?.role;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        let where = { schoolId };
        if (role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { userId: req.user?.id } });
            if (!student || !student.classId) {
                res.json({ success: true, data: [] });
                return;
            }
            where.classId = student.classId;
        }
        else if (role === 'TEACHER') {
            const teacher = await prisma_1.prisma.teacher.findUnique({ where: { userId: req.user?.id } });
            if (teacher) {
                where.uploadedByTeacherId = teacher.id;
            }
        }
        const resources = await prisma_1.prisma.learningResource.findMany({
            where,
            include: {
                class: { select: { name: true, division: true } },
                subject: { select: { name: true } },
                teacher: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: resources });
    }
    catch (error) {
        next(error);
    }
}
exports.getResources = getResources;
async function createResource(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const teacher = await prisma_1.prisma.teacher.findUnique({ where: { userId: req.user?.id } });
        if (!teacher)
            throw new errorHandler_1.AppError('Teacher profile not found', 404, 'NOT_FOUND');
        const resource = await prisma_1.prisma.learningResource.create({
            data: {
                schoolId,
                classId: data.classId,
                subjectId: data.subjectId,
                title: data.title,
                topic: data.topic || null,
                description: data.description || null,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                uploadedByTeacherId: teacher.id,
                uploadedByUserId: req.user.id
            },
            include: {
                class: { select: { name: true, division: true } },
                subject: { select: { name: true } }
            }
        });
        res.status(201).json({ success: true, data: resource });
    }
    catch (error) {
        next(error);
    }
}
exports.createResource = createResource;
//# sourceMappingURL=resources.controller.js.map