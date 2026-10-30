"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const users_schema_1 = require("./users.schema");
const users_controller_1 = require("./users.controller");
exports.usersRouter = (0, express_1.Router)();
// Users routes are accessible by SUPER_ADMIN and PRINCIPAL.
// The controller enforces that PRINCIPAL can only manage their own school's users.
exports.usersRouter.use(auth_controller_1.authenticate, (0, auth_controller_1.requireRole)('SUPER_ADMIN', 'PRINCIPAL'));
// GET /api/v1/users
exports.usersRouter.get('/', users_controller_1.getAllUsers);
// POST /api/v1/users
exports.usersRouter.post('/', (0, validate_1.validateRequest)(users_schema_1.createUserSchema), users_controller_1.createUser);
// PUT /api/v1/users/:id
exports.usersRouter.put('/:id', (0, validate_1.validateRequest)(users_schema_1.updateUserSchema), users_controller_1.updateUser);
//# sourceMappingURL=users.router.js.map