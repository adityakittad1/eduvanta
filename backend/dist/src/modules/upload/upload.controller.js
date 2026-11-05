"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = void 0;
const errorHandler_1 = require("../../middleware/errorHandler");
const supabase_1 = require("../../lib/supabase");
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../../config/env");
async function handleUpload(req, res, next) {
    try {
        const file = req.file;
        const schoolId = req.tenant.id;
        if (!file) {
            throw new errorHandler_1.AppError('No file provided', 400, 'BAD_REQUEST');
        }
        if (!schoolId) {
            throw new errorHandler_1.AppError('No tenant context', 400, 'BAD_REQUEST');
        }
        // If Supabase is configured, upload the file to Supabase Storage
        if (supabase_1.supabase) {
            const fileBuffer = fs_1.default.readFileSync(file.path);
            const filePath = `${schoolId}/${file.filename}`;
            let uploadRes = await supabase_1.supabase.storage
                .from('eduvanta-assets')
                .upload(filePath, fileBuffer, {
                contentType: file.mimetype,
                upsert: true,
            });
            if (uploadRes.error && (uploadRes.error.message?.includes('not found') || uploadRes.error.statusCode === '404')) {
                // Try creating the bucket automatically
                try {
                    await supabase_1.supabase.storage.createBucket('eduvanta-assets', { public: true });
                    uploadRes = await supabase_1.supabase.storage
                        .from('eduvanta-assets')
                        .upload(filePath, fileBuffer, {
                        contentType: file.mimetype,
                        upsert: true,
                    });
                }
                catch {
                    // ignore create error
                }
            }
            if (!uploadRes.error) {
                // Cleanup local temp file
                try {
                    fs_1.default.unlinkSync(file.path);
                }
                catch { }
                const { data: publicUrlData } = supabase_1.supabase.storage
                    .from('eduvanta-assets')
                    .getPublicUrl(filePath);
                res.status(201).json({
                    success: true,
                    data: {
                        url: publicUrlData.publicUrl,
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype,
                        provider: 'supabase'
                    }
                });
                return;
            }
            // If Supabase storage is unavailable or bucket not permitted, provide safe data URL fallback for images
            if (file.mimetype.startsWith('image/') && fileBuffer.length <= 10 * 1024 * 1024) {
                try {
                    fs_1.default.unlinkSync(file.path);
                }
                catch { }
                const base64 = fileBuffer.toString('base64');
                const dataUrl = `data:${file.mimetype};base64,${base64}`;
                res.status(201).json({
                    success: true,
                    data: {
                        url: dataUrl,
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype,
                        provider: 'data-url'
                    }
                });
                return;
            }
            throw new errorHandler_1.AppError('Failed to upload file: ' + uploadRes.error.message, 500, 'INTERNAL_ERROR');
        }
        // Fallback: Local Storage (For Dev only)
        // Create the final relative URL for local access
        const fileUrl = `${env_1.env.FRONTEND_URL}/api/v1/upload/${schoolId}/${file.filename}`;
        res.status(201).json({
            success: true,
            data: {
                url: fileUrl,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                provider: 'local'
            }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.handleUpload = handleUpload;
//# sourceMappingURL=upload.controller.js.map