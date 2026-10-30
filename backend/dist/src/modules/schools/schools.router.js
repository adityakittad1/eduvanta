"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolsRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const schools_schema_1 = require("./schools.schema");
const schools_controller_1 = require("./schools.controller");
exports.schoolsRouter = (0, express_1.Router)();
// All school routes are restricted to SUPER_ADMIN only
exports.schoolsRouter.use(auth_controller_1.authenticate, (0, auth_controller_1.requireRole)('SUPER_ADMIN'));
// GET /api/v1/schools
exports.schoolsRouter.get('/', schools_controller_1.getAllSchools);
// GET /api/v1/schools/:id
exports.schoolsRouter.get('/:id', schools_controller_1.getSchoolById);
// POST /api/v1/schools
exports.schoolsRouter.post('/', (0, validate_1.validateRequest)(schools_schema_1.createSchoolSchema), schools_controller_1.createSchool);
// PUT /api/v1/schools/:id
exports.schoolsRouter.put('/:id', (0, validate_1.validateRequest)(schools_schema_1.updateSchoolSchema), schools_controller_1.updateSchool);
//# sourceMappingURL=schools.router.js.map