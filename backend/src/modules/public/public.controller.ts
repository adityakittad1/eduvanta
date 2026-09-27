// ============================================================
// Public Website Controller
// These endpoints are unauthenticated — public facing.
// Only safe, explicitly public data is returned.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as publicService from './public.service';

// GET /api/v1/public/schools
export async function listSchools(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schools = await publicService.listPublicSchools();
    res.json({ success: true, data: schools });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/public/schools/:slug
export async function getSchoolHome(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const schoolId = await publicService.resolvePublicSchool(slug);
    const data = await publicService.getPublicHomePageData(schoolId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/public/schools/:slug/profile
export async function getSchoolProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const schoolId = await publicService.resolvePublicSchool(slug);
    const data = await publicService.getPublicSchoolProfile(schoolId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/public/schools/:slug/gallery
export async function getSchoolGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const category = req.query.category as string | undefined;
    const schoolId = await publicService.resolvePublicSchool(slug);
    const data = await publicService.getPublicGallery(schoolId, category);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/public/schools/:slug/notices
export async function getSchoolNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const schoolId = await publicService.resolvePublicSchool(slug);
    const data = await publicService.getPublicNotices(schoolId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/public/schools/:slug/events
export async function getSchoolEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const schoolId = await publicService.resolvePublicSchool(slug);
    const data = await publicService.getPublicEvents(schoolId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/public/schools/:slug/facilities
export async function getSchoolFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const schoolId = await publicService.resolvePublicSchool(slug);
    const data = await publicService.getPublicFacilities(schoolId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
