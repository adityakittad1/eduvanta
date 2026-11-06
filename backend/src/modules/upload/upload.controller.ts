import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { supabase } from '../../lib/supabase';
import fs from 'fs';
import { env } from '../../config/env';

export async function handleUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    const schoolId = req.tenant!.id;

    if (!file) {
      throw new AppError('No file provided', 400, 'BAD_REQUEST');
    }

    if (!schoolId) {
      throw new AppError('No tenant context', 400, 'BAD_REQUEST');
    }

    // Determine file buffer and filename safely for both memory and disk storage
    const fileBuffer = file.buffer || (file.path && fs.existsSync(file.path) ? fs.readFileSync(file.path) : Buffer.from([]));
    const filename = file.filename || `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // If Supabase is configured, upload the file to Supabase Storage
    if (supabase) {
      const filePath = `${schoolId}/${filename}`;
      
      let uploadRes = await supabase.storage
        .from('eduvanta-assets')
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadRes.error && (uploadRes.error.message?.includes('not found') || (uploadRes.error as any).statusCode === '404')) {
        // Try creating the bucket automatically
        try {
          await supabase.storage.createBucket('eduvanta-assets', { public: true });
          uploadRes = await supabase.storage
            .from('eduvanta-assets')
            .upload(filePath, fileBuffer, {
              contentType: file.mimetype,
              upsert: true,
            });
        } catch {
          // ignore create error
        }
      }

      if (!uploadRes.error) {
        // Cleanup local temp file if it was on disk
        if (file.path && fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch {}
        }

        const { data: publicUrlData } = supabase.storage
          .from('eduvanta-assets')
          .getPublicUrl(filePath);

        res.status(201).json({
          success: true,
          data: {
            url: publicUrlData.publicUrl,
            filename: filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            provider: 'supabase'
          }
        });
        return;
      }

      // If Supabase storage is unavailable or bucket not permitted, provide safe data URL fallback for images
      if (file.mimetype.startsWith('image/') && fileBuffer.length > 0 && fileBuffer.length <= 10 * 1024 * 1024) {
        if (file.path && fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch {}
        }
        const base64 = fileBuffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;

        res.status(201).json({
          success: true,
          data: {
            url: dataUrl,
            filename: filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            provider: 'data-url'
          }
        });
        return;
      }

      // If storage failed, provide fallback
      if (file.mimetype.startsWith('image/') && fileBuffer.length > 0) {
        const base64 = fileBuffer.toString('base64');
        res.status(201).json({
          success: true,
          data: {
            url: `data:${file.mimetype};base64,${base64}`,
            filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            provider: 'data-url'
          }
        });
        return;
      }

      throw new AppError('Failed to upload file: ' + (uploadRes?.error?.message || 'Storage error'), 500, 'INTERNAL_ERROR');
    }

    // Fallback: Local Storage (For Dev only)
    // Create the final relative URL for local access
    const fileUrl = `${env.FRONTEND_URL}/api/v1/upload/${schoolId}/${filename}`;
    
    res.status(201).json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        provider: 'local'
      }
    });
  } catch (error) {
    next(error);
  }
}
