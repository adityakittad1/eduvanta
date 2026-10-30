"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAttendanceSchema = void 0;
const zod_1 = require("zod");
exports.markAttendanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        classId: zod_1.z.string().min(1, 'Class ID is required'),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        records: zod_1.z.array(zod_1.z.object({
            studentId: zod_1.z.string().min(1, 'Student ID is required'),
            status: zod_1.z.enum(['PRESENT', 'ABSENT', 'LATE', 'HOLIDAY']),
            remarks: zod_1.z.string().optional()
        })).min(1, 'At least one attendance record is required')
    }),
});
//# sourceMappingURL=attendance.schema.js.map