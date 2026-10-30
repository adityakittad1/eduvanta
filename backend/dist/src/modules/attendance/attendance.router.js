"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const attendance_schema_1 = require("./attendance.schema");
const attendance_controller_1 = require("./attendance.controller");
exports.attendanceRouter = (0, express_1.Router)();
exports.attendanceRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// Principals and Teachers can mark and view daily class attendance
exports.attendanceRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(attendance_schema_1.markAttendanceSchema), attendance_controller_1.markAttendance);
exports.attendanceRouter.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), attendance_controller_1.getDailyAttendance);
// Everyone (including student themselves) can view a specific student's attendance history
exports.attendanceRouter.get('/student/:studentId', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER', 'STUDENT'), attendance_controller_1.getStudentAttendance);
//# sourceMappingURL=attendance.router.js.map