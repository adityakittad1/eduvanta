"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middleware/validate");
const auth_schema_1 = require("./auth.schema");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.use((0, cookie_parser_1.default)());
// POST /api/v1/auth/login
exports.authRouter.post('/login', (0, validate_1.validateRequest)(auth_schema_1.loginSchema), auth_controller_1.login);
// POST /api/v1/auth/logout
exports.authRouter.post('/logout', auth_controller_1.logout);
// POST /api/v1/auth/refresh
exports.authRouter.post('/refresh', auth_controller_1.refreshTokens);
// GET /api/v1/auth/me
exports.authRouter.get('/me', auth_controller_1.authenticate, auth_controller_1.getMe);
// POST /api/v1/auth/change-password
exports.authRouter.post('/change-password', auth_controller_1.authenticate, (0, validate_1.validateRequest)(auth_schema_1.changePasswordSchema), auth_controller_1.changePassword);
//# sourceMappingURL=auth.router.js.map