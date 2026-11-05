"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotice = exports.createNotice = exports.getNotices = void 0;
const prisma_1 = require("../../lib/prisma");
const supabase_1 = require("../../lib/supabase");
const authDb_1 = require("../../lib/authDb");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getNotices(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const role = req.user?.role;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        let where = { schoolId };
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
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
                        { targetAudience: 'CLASS' }
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
                return;
            }
            catch {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        // Fallback via Supabase
        if (supabase_1.supabase) {
            let query = supabase_1.supabase.from('notices').select('*').eq('school_id', schoolId).order('created_at', { ascending: false });
            if (role === 'STUDENT' || role === 'TEACHER') {
                query = query.eq('status', 'PUBLISHED');
            }
            const { data, error } = await query;
            if (error)
                throw new errorHandler_1.AppError('Failed to retrieve notices', 500, 'INTERNAL_ERROR');
            const mapped = (data || []).map((n) => ({
                id: n.id,
                schoolId: n.school_id,
                title: n.title,
                content: n.content,
                targetAudience: n.target_audience,
                targetClassId: n.target_class_id,
                status: n.status,
                visibility: n.visibility,
                publishedAt: n.published_at,
                createdAt: n.created_at,
                updatedAt: n.updated_at,
                createdBy: { email: 'faculty@school.in' },
                targetClass: null
            }));
            res.json({ success: true, data: mapped });
            return;
        }
        res.json({ success: true, data: [] });
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
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const notice = await prisma_1.prisma.notice.create({
                    data: {
                        schoolId,
                        title: data.title,
                        content: data.content,
                        targetAudience: data.targetAudience,
                        targetClassId: data.targetClassId || null,
                        status: data.status || 'PUBLISHED',
                        visibility: data.visibility === 'PUBLIC' ? 'PUBLIC' : 'INTERNAL',
                        publishedAt: new Date(),
                        createdByUserId: req.user.id
                    },
                    include: {
                        targetClass: { select: { name: true, division: true } }
                    }
                });
                res.status(201).json({ success: true, data: notice });
                return;
            }
            catch {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        // Fallback via Supabase
        if (supabase_1.supabase) {
            const { data: newNotice, error } = await supabase_1.supabase.from('notices').insert({
                school_id: schoolId,
                title: data.title,
                content: data.content,
                target_audience: data.targetAudience,
                target_class_id: data.targetClassId || null,
                status: data.status || 'PUBLISHED',
                visibility: data.visibility === 'PUBLIC' ? 'PUBLIC' : 'INTERNAL',
                created_by_user_id: req.user.id,
                published_at: new Date().toISOString()
            }).select().single();
            if (error)
                throw new errorHandler_1.AppError('Failed to publish notice: ' + error.message, 500, 'INTERNAL_ERROR');
            res.status(201).json({
                success: true,
                data: {
                    id: newNotice.id,
                    schoolId: newNotice.school_id,
                    title: newNotice.title,
                    content: newNotice.content,
                    targetAudience: newNotice.target_audience,
                    targetClassId: newNotice.target_class_id,
                    status: newNotice.status,
                    visibility: newNotice.visibility,
                    publishedAt: newNotice.published_at,
                    createdAt: newNotice.created_at,
                    targetClass: null
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
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
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const existing = await prisma_1.prisma.notice.findFirst({ where: { id, schoolId } });
                if (!existing) {
                    throw new errorHandler_1.AppError('Notice not found', 404, 'NOT_FOUND');
                }
                await prisma_1.prisma.notice.delete({ where: { id } });
                res.json({ success: true, message: 'Notice deleted successfully' });
                return;
            }
            catch (err) {
                if (err instanceof errorHandler_1.AppError)
                    throw err;
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            await supabase_1.supabase.from('notices').delete().eq('id', id).eq('school_id', schoolId);
            res.json({ success: true, message: 'Notice deleted successfully' });
            return;
        }
        throw new errorHandler_1.AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.deleteNotice = deleteNotice;
//# sourceMappingURL=notices.controller.js.map