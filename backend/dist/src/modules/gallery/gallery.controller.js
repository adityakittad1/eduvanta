"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGalleryItem = exports.uploadGalleryItem = exports.getGalleryItems = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getGalleryItems(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const items = await prisma_1.prisma.galleryItem.findMany({
            where: { schoolId },
            include: {
                uploadedBy: { select: { email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: items });
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
    }
    catch (error) {
        next(error);
    }
}
exports.uploadGalleryItem = uploadGalleryItem;
// PATCH /gallery/:id — update isPublic flag (and optionally other fields)
async function updateGalleryItem(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const id = req.params.id;
        // Verify ownership — gallery item must belong to this school
        const existing = await prisma_1.prisma.galleryItem.findUnique({ where: { id } });
        if (!existing || existing.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Gallery item not found', 404, 'NOT_FOUND');
        }
        const { isPublic } = req.body;
        const updated = await prisma_1.prisma.galleryItem.update({
            where: { id },
            data: {
                ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
            }
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
}
exports.updateGalleryItem = updateGalleryItem;
//# sourceMappingURL=gallery.controller.js.map