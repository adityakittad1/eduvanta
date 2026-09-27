import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createGalleryItemSchema } from './gallery.schema';
import { getGalleryItems, uploadGalleryItem, updateGalleryItem } from './gallery.controller';

export const galleryRouter = Router();

galleryRouter.use(authenticate, requireSchool);

galleryRouter.get('/', getGalleryItems);
galleryRouter.post('/', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(createGalleryItemSchema), uploadGalleryItem);
galleryRouter.patch('/:id', requireRole('PRINCIPAL', 'TEACHER'), updateGalleryItem);
