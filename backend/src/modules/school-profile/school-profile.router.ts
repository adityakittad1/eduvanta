import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { updateSchoolProfileSchema } from './school-profile.schema';
import {
  getSchoolProfile,
  updateSchoolProfile,
  getFacilities,
  createFacility,
  deleteFacility,
  getAchievements,
  createAchievement,
  deleteAchievement,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from './school-profile.controller';

export const schoolProfileRouter = Router();

schoolProfileRouter.use(authenticate, requireSchool);

// School profile
schoolProfileRouter.get('/', getSchoolProfile);
schoolProfileRouter.patch('/', requireRole('PRINCIPAL'), validateRequest(updateSchoolProfileSchema), updateSchoolProfile);

// Facilities
schoolProfileRouter.get('/facilities', getFacilities);
schoolProfileRouter.post('/facilities', requireRole('PRINCIPAL'), createFacility);
schoolProfileRouter.delete('/facilities/:id', requireRole('PRINCIPAL'), deleteFacility);

// Achievements
schoolProfileRouter.get('/achievements', getAchievements);
schoolProfileRouter.post('/achievements', requireRole('PRINCIPAL'), createAchievement);
schoolProfileRouter.delete('/achievements/:id', requireRole('PRINCIPAL'), deleteAchievement);

// Events (public calendar)
schoolProfileRouter.get('/events', getEvents);
schoolProfileRouter.post('/events', requireRole('PRINCIPAL'), createEvent);
schoolProfileRouter.patch('/events/:id', requireRole('PRINCIPAL'), updateEvent);
schoolProfileRouter.delete('/events/:id', requireRole('PRINCIPAL'), deleteEvent);
