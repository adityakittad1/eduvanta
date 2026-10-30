"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const auth_controller_1 = require("../auth/auth.controller");
const upload_controller_1 = require("./upload.controller");
const env_1 = require("../../config/env");
const errorHandler_1 = require("../../middleware/errorHandler");
exports.uploadRouter = (0, express_1.Router)();
// Temp upload dir for multer (local processing before pushing to Supabase)
const isServerlessEnv = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const baseUploadDir = path_1.default.resolve(isServerlessEnv ? '/tmp/uploads' : env_1.env.FILE_UPLOAD_DIR);
try {
    if (!fs_1.default.existsSync(baseUploadDir)) {
        fs_1.default.mkdirSync(baseUploadDir, { recursive: true });
    }
}
catch {
    // Silent fallback for read-only serverless environments
}
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        const tenantId = req.tenant?.id?.toString() || 'unknown';
        const tenantDir = path_1.default.join(baseUploadDir, tenantId);
        try {
            if (!fs_1.default.existsSync(tenantDir)) {
                fs_1.default.mkdirSync(tenantDir, { recursive: true });
            }
        }
        catch {
            // Silent fallback
        }
        cb(null, tenantDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const sanitizedBase = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${sanitizedBase}-${crypto_1.default.randomUUID()}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: env_1.env.FILE_UPLOAD_MAX_SIZE_MB * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errorHandler_1.AppError('File type not allowed', 400, 'BAD_REQUEST'));
        }
    }
});
exports.uploadRouter.use(auth_controller_1.authenticate);
exports.uploadRouter.post('/', upload.single('file'), upload_controller_1.handleUpload);
// Secure download endpoint (only relevant for local fallback)
exports.uploadRouter.get('/:schoolId/:filename', auth_controller_1.authenticate, (req, res, next) => {
    const { schoolId, filename } = req.params;
    if (schoolId !== req.tenant.id.toString()) {
        return next(new errorHandler_1.AppError('Forbidden: access to file from another tenant', 403, 'FORBIDDEN'));
    }
    const filePath = path_1.default.join(baseUploadDir, schoolId, filename);
    if (!fs_1.default.existsSync(filePath)) {
        return next(new errorHandler_1.AppError('File not found', 404, 'NOT_FOUND'));
    }
    res.sendFile(filePath);
});
//# sourceMappingURL=upload.router.js.map