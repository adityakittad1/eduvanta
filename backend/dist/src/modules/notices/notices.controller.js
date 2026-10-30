"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotice = exports.createNotice = exports.getNotices = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getNotices(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const role = req.user?.role;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        let where = { schoolId };
        if (role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { userId: req.user?.id } });
            if (!student) {
                res.json({ success: true, data: [] });
                return;
            }
            where.status = 'PUBLISHED';
            where.OR = [
                { targetAudience: 'ALL' },
                { targetAudience: 'STUDENTS' },
                { targetAudience: 'CLASS', targetClassId: student.classId }
            ];
        }
        else if (role === 'TEACHER') {
            where.status = 'PUBLISHED';
            where.OR = [
                { targetAudience: 'ALL' },
                { targetAudience: 'TEACHERS' },
                { targetAudience: 'CLASS' } // Teachers can see all class notices for now
            ];
        }
        const notices = await prisma_1.prisma.notice.findMany({
            where,
            include: {
                createdBy: { select: { email: true } },
                targetClass: { select: { name: true, division: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: notices });
    }
    catch (error) {
        next(error);
    }
}
exports.getNotices = getNotices;
async function createNotice(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const notice = await prisma_1.prisma.notice.create({
            data: {
                schoolId,
                title: data.title,
                content: data.content,
                targetAudience: data.targetAudience,
                targetClassId: data.targetClassId || null,
                status: 'PUBLISHED',
                visibility: data.visibility === 'PUBLIC' ? 'PUBLIC' : 'INTERNAL',
                publishedAt: new Date(),
                createdByUserId: req.user.id
            },
            include: {
                targetClass: { select: { name: true, division: true } }
            }
        });
        res.status(201).json({ success: true, data: notice });
    }
    catch (error) {
        next(error);
    }
}
exports.createNotice = createNotice;
async function deleteNotice(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const id = req.params.id;
        const existing = await prisma_1.prisma.notice.findFirst({ where: { id, schoolId } });
        if (!existing) {
            throw new errorHandler_1.AppError('Notice not found', 404, 'NOT_FOUND');
        }
        await prisma_1.prisma.notice.delete({ where: { id } });
        res.json({ success: true, message: 'Notice deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
exports.deleteNotice = deleteNotice;
//# sourceMappingURL=notices.controller.js.map