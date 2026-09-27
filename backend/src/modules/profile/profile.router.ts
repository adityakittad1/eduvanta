import { Router } from 'express';
import { authenticate, requireRole } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { updateSchoolProfileSchema, addFacilitySchema, addAchievementSchema } from './profile.schema';
import {
  getMySchoolProfile,
  updateMySchoolProfile,
  addFacility,
  removeFacility,
  addAchievement,
  removeAchievement,
} from './profile.controller';

export const profileRouter = Router();

// Everyone in a school can view the school profile
profileRouter.get('/school', authenticate, getMySchoolProfile);

// Only PRINCIPAL can update the school profile and manage facilities/achievements
const requirePrincipal = requireRole('PRINCIPAL');

profileRouter.put('/school', authenticate, requirePrincipal, validateRequest(updateSchoolProfileSchema), updateMySchoolProfile);

profileRouter.post('/school/facilities', authenticate, requirePrincipal, validateRequest(addFacilitySchema), addFacility);
profileRouter.delete('/school/facilities/:id', authenticate, requirePrincipal, removeFacility);

profileRouter.post('/school/achievements', authenticate, requirePrincipal, validateRequest(addAchievementSchema), addAchievement);
profileRouter.delete('/school/achievements/:id', authenticate, requirePrincipal, removeAchievement);
