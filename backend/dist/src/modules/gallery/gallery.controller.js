"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGalleryItem = exports.uploadGalleryItem = exports.getGalleryItems = void 0;
const prisma_1 = require("../../lib/prisma");
const supabase_1 = require("../../lib/supabase");
const authDb_1 = require("../../lib/authDb");
const dataDb_1 = require("../../lib/dataDb");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getGalleryItems(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const items = await prisma_1.prisma.galleryItem.findMany({
                    where: { schoolId },
                    include: {
                        uploadedBy: { select: { email: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                res.json({ success: true, data: items });
                return;
            }
            catch {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { data: items, error } = await supabase_1.supabase
                .from('gallery_items')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });
            if (error)
                throw new errorHandler_1.AppError('Failed to fetch gallery items: ' + error.message, 500, 'INTERNAL_ERROR');
            const mapped = (items || []).map(item => ({
                id: item.id,
                schoolId: item.school_id,
                title: item.title,
                description: item.description,
                category: item.category,
                fileUrl: item.file_url,
                isPublic: item.is_public,
                uploadedByUserId: item.uploaded_by_user_id,
                createdAt: item.created_at,
                uploadedBy: { email: 'admin@school.eduvanta' }
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
exports.getGalleryItems = getGalleryItems;
async function uploadGalleryItem(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const item = await prisma_1.prisma.galleryItem.create({
                    data: {
                        schoolId,
                        title: data.title,
                        description: data.description || null,
                        category: data.category,
                        fileUrl: data.fileUrl,
                        isPublic: Boolean(data.isPublic) || false,
                        uploadedByUserId: req.user.id
                    }
                });
                res.status(201).json({ success: true, data: item });
                return;
            }
            catch {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const itemId = (0, dataDb_1.generateCuid)();
            const nowIso = new Date().toISOString();
            const { data: item, error } = await supabase_1.supabase
                .from('gallery_items')
                .insert({
                id: itemId,
                school_id: schoolId,
                title: data.title,
                description: data.description || null,
                category: data.category,
                file_url: data.fileUrl,
                is_public: Boolean(data.isPublic) || false,
                uploaded_by_user_id: req.user.id,
                created_at: nowIso
            })
                .select()
                .single();
            if (error)
                throw new errorHandler_1.AppError('Failed to save gallery item: ' + error.message, 500, 'INTERNAL_ERROR');
            res.status(201).json({
                success: true,
                data: {
                    id: item.id,
                    schoolId: item.school_id,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    fileUrl: item.file_url,
                    isPublic: item.is_public,
                    uploadedByUserId: item.uploaded_by_user_id,
                    createdAt: item.created_at,
                    uploadedBy: { email: req.user.email }
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.uploadGalleryItem = uploadGalleryItem;
// PATCH /gallery/:id: update isPublic flag (and optionally other fields)
async function updateGalleryItem(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const id = req.params.id;
        const { isPublic } = req.body;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const existing = await prisma_1.prisma.galleryItem.findUnique({ where: { id } });
                if (!existing || existing.schoolId !== schoolId) {
                    throw new errorHandler_1.AppError('Gallery item not found', 404, 'NOT_FOUND');
                }
                const updated = await prisma_1.prisma.galleryItem.update({
                    where: { id },
                    data: {
                        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
                    }
                });
                res.json({ success: true, data: updated });
                return;
            }
            catch (err) {
                if (err instanceof errorHandler_1.AppError)
                    throw err;
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { data: updated, error } = await supabase_1.supabase
                .from('gallery_items')
                .update({
                ...(isPublic !== undefined && { is_public: Boolean(isPublic) })
            })
                .eq('id', id)
                .eq('school_id', schoolId)
                .select()
                .single();
            if (error)
                throw new errorHandler_1.AppError('Failed to update gallery item: ' + error.message, 500, 'INTERNAL_ERROR');
            if (!updated)
                throw new errorHandler_1.AppError('Gallery item not found', 404, 'NOT_FOUND');
            res.json({
                success: true,
                data: {
                    id: updated.id,
                    schoolId: updated.school_id,
                    title: updated.title,
                    description: updated.description,
                    category: updated.category,
                    fileUrl: updated.file_url,
                    isPublic: updated.is_public,
                    uploadedByUserId: updated.uploaded_by_user_id,
                    createdAt: updated.created_at
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.updateGalleryItem = updateGalleryItem;
//# sourceMappingURL=gallery.controller.js.map