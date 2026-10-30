"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const profile_schema_1 = require("./profile.schema");
const profile_controller_1 = require("./profile.controller");
exports.profileRouter = (0, express_1.Router)();
// Everyone in a school can view the school profile
exports.profileRouter.get('/school', auth_controller_1.authenticate, profile_controller_1.getMySchoolProfile);
// Only PRINCIPAL can update the school profile and manage facilities/achievements
const requirePrincipal = (0, auth_controller_1.requireRole)('PRINCIPAL');
exports.profileRouter.put('/school', auth_controller_1.authenticate, requirePrincipal, (0, validate_1.validateRequest)(profile_schema_1.updateSchoolProfileSchema), profile_controller_1.updateMySchoolProfile);
exports.profileRouter.post('/school/facilities', auth_controller_1.authenticate, requirePrincipal, (0, validate_1.validateRequest)(profile_schema_1.addFacilitySchema), profile_controller_1.addFacility);
exports.profileRouter.delete('/school/facilities/:id', auth_controller_1.authenticate, requirePrincipal, profile_controller_1.removeFacility);
exports.profileRouter.post('/school/achievements', auth_controller_1.authenticate, requirePrincipal, (0, validate_1.validateRequest)(profile_schema_1.addAchievementSchema), profile_controller_1.addAchievement);
exports.profileRouter.delete('/school/achievements/:id', auth_controller_1.authenticate, requirePrincipal, profile_controller_1.removeAchievement);
//# sourceMappingURL=profile.router.js.map