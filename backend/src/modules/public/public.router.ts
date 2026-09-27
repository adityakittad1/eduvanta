// ============================================================
// Public Website Router — No authentication required
// These routes serve the public school website.
// ============================================================

import { Router } from 'express';
import {
  listSchools,
  getSchoolHome,
  getSchoolProfile,
  getSchoolGallery,
  getSchoolNotices,
  getSchoolEvents,
  getSchoolFacilities,
} from './public.controller';

export const publicRouter = Router();

// School directory
publicRouter.get('/schools', listSchools);

// Full home page data (single efficient call)
publicRouter.get('/schools/:slug', getSchoolHome);

// Individual section endpoints
publicRouter.get('/schools/:slug/profile', getSchoolProfile);
publicRouter.get('/schools/:slug/gallery', getSchoolGallery);
publicRouter.get('/schools/:slug/notices', getSchoolNotices);
publicRouter.get('/schools/:slug/events', getSchoolEvents);
publicRouter.get('/schools/:slug/facilities', getSchoolFacilities);
