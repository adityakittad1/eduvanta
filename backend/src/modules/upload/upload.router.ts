import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticate } from '../auth/auth.controller';
import { handleUpload } from './upload.controller';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';

export const uploadRouter = Router();

// Temp upload dir for multer (local processing before pushing to Supabase)
const baseUploadDir = path.resolve(env.FILE_UPLOAD_DIR);
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const tenantId = req.tenant?.id?.toString() || 'unknown';
    const tenantDir = path.join(baseUploadDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }
    cb(null, tenantDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${sanitizedBase}-${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.FILE_UPLOAD_MAX_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('File type not allowed', 400, 'BAD_REQUEST'));
    }
  }
});

uploadRouter.use(authenticate);

uploadRouter.post('/', upload.single('file'), handleUpload);

// Secure download endpoint (only relevant for local fallback)
uploadRouter.get('/:schoolId/:filename', authenticate, (req: any, res, next) => {
  const { schoolId, filename } = req.params;
  if (schoolId !== req.tenant!.id.toString()) {
    return next(new AppError('Forbidden: access to file from another tenant', 403, 'FORBIDDEN'));
  }
  const filePath = path.join(baseUploadDir, schoolId, filename);
  if (!fs.existsSync(filePath)) {
    return next(new AppError('File not found', 404, 'NOT_FOUND'));
  }
  res.sendFile(filePath);
});
