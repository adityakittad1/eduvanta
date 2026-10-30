"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolProfileRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const school_profile_schema_1 = require("./school-profile.schema");
const school_profile_controller_1 = require("./school-profile.controller");
exports.schoolProfileRouter = (0, express_1.Router)();
exports.schoolProfileRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// School profile
exports.schoolProfileRouter.get('/', school_profile_controller_1.getSchoolProfile);
exports.schoolProfileRouter.patch('/', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(school_profile_schema_1.updateSchoolProfileSchema), school_profile_controller_1.updateSchoolProfile);
// Facilities
exports.schoolProfileRouter.get('/facilities', school_profile_controller_1.getFacilities);
exports.schoolProfileRouter.post('/facilities', (0, auth_controller_1.requireRole)('PRINCIPAL'), school_profile_controller_1.createFacility);
exports.schoolProfileRouter.delete('/facilities/:id', (0, auth_controller_1.requireRole)('PRINCIPAL'), school_profile_controller_1.deleteFacility);
// Achievements
exports.schoolProfileRouter.get('/achievements', school_profile_controller_1.getAchievements);
exports.schoolProfileRouter.post('/achievements', (0, auth_controller_1.requireRole)('PRINCIPAL'), school_profile_controller_1.createAchievement);
exports.schoolProfileRouter.delete('/achievements/:id', (0, auth_controller_1.requireRole)('PRINCIPAL'), school_profile_controller_1.deleteAchievement);
// Events (public calendar)
exports.schoolProfileRouter.get('/events', school_profile_controller_1.getEvents);
exports.schoolProfileRouter.post('/events', (0, auth_controller_1.requireRole)('PRINCIPAL'), school_profile_controller_1.createEvent);
exports.schoolProfileRouter.patch('/events/:id', (0, auth_controller_1.requireRole)('PRINCIPAL'), school_profile_controller_1.updateEvent);
exports.schoolProfileRouter.delete('/events/:id', (0, auth_controller_1.requireRole)('PRINCIPAL'), school_profile_controller_1.deleteEvent);
//# sourceMappingURL=school-profile.router.js.map