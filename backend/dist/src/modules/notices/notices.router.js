"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noticesRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const notices_schema_1 = require("./notices.schema");
const notices_controller_1 = require("./notices.controller");
exports.noticesRouter = (0, express_1.Router)();
exports.noticesRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
exports.noticesRouter.get('/', notices_controller_1.getNotices);
exports.noticesRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(notices_schema_1.createNoticeSchema), notices_controller_1.createNotice);
exports.noticesRouter.delete('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), notices_controller_1.deleteNotice);
//# sourceMappingURL=notices.router.js.map