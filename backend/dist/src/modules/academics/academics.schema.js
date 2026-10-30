"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMarksSchema = exports.createAssessmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssessmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        classId: zod_1.z.string().min(1, 'Class ID is required'),
        subjectId: zod_1.z.string().min(1, 'Subject ID is required'),
        name: zod_1.z.string().min(1, 'Assessment name is required'),
        type: zod_1.z.enum(['UNIT_TEST', 'HALF_YEARLY', 'ANNUAL', 'PRACTICAL', 'PROJECT', 'OTHER']),
        maxMarks: zod_1.z.number().min(1, 'Max marks must be greater than 0'),
        conductedDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().nullable(),
        academicYear: zod_1.z.string().min(1, 'Academic year is required')
    }),
});
exports.saveMarksSchema = zod_1.z.object({
    body: zod_1.z.object({
        records: zod_1.z.array(zod_1.z.object({
            studentId: zod_1.z.string().min(1, 'Student ID is required'),
            marksObtained: zod_1.z.number().min(0, 'Marks cannot be negative'),
            remarks: zod_1.z.string().optional()
        })).min(1, 'At least one mark record is required')
    }),
});
//# sourceMappingURL=academics.schema.js.map