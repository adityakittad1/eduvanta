"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourcesRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const resources_schema_1 = require("./resources.schema");
const resources_controller_1 = require("./resources.controller");
exports.resourcesRouter = (0, express_1.Router)();
exports.resourcesRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
exports.resourcesRouter.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER', 'STUDENT'), resources_controller_1.getResources);
exports.resourcesRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(resources_schema_1.createResourceSchema), resources_controller_1.createResource);
//# sourceMappingURL=resources.router.js.map