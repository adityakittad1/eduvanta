"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignStudentsSchema = exports.assignTeacherSchema = exports.createSubjectSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
exports.createClassSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Class name is required'),
        division: zod_1.z.string().optional().or(zod_1.z.literal('')),
        academicYear: zod_1.z.string().min(1, 'Academic year is required'),
    }),
});
exports.createSubjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Subject name is required'),
        code: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
exports.assignTeacherSchema = zod_1.z.object({
    body: zod_1.z.object({
        teacherId: zod_1.z.string().min(1, 'Teacher ID is required'),
        subjectId: zod_1.z.string().min(1, 'Subject ID is required'),
        academicYear: zod_1.z.string().min(1, 'Academic year is required'),
    }),
});
exports.assignStudentsSchema = zod_1.z.object({
    body: zod_1.z.object({
        studentIds: zod_1.z.array(zod_1.z.string()).min(1, 'At least one student must be selected'),
    }),
});
//# sourceMappingURL=classes.schema.js.map