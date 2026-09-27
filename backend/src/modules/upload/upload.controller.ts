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

    // If Supabase is configured, upload the file to Supabase Storage
    if (supabase) {
      const fileBuffer = fs.readFileSync(file.path);
      const filePath = `${schoolId}/${file.filename}`;
      
      const { error } = await supabase.storage
        .from('eduvanta-assets') // Ensure this bucket exists in Supabase!
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new AppError('Failed to upload to Supabase: ' + error.message, 500, 'INTERNAL_ERROR');
      }

      // Cleanup local temp file
      fs.unlinkSync(file.path);

      const { data: publicUrlData } = supabase.storage
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

    // Fallback: Local Storage (For Dev only)
    // Create the final relative URL for local access
    const fileUrl = `${env.FRONTEND_URL}/api/v1/upload/${schoolId}/${file.filename}`;
    
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
  } catch (error) {
    next(error);
  }
}
