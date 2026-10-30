"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuizSchema = exports.addQuestionSchema = exports.createQuizSchema = void 0;
const zod_1 = require("zod");
exports.createQuizSchema = zod_1.z.object({
    body: zod_1.z.object({
        classId: zod_1.z.string().min(1, 'Class ID is required'),
        subjectId: zod_1.z.string().min(1, 'Subject ID is required'),
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
        topic: zod_1.z.string().optional()
    })
});
exports.addQuestionSchema = zod_1.z.object({
    body: zod_1.z.object({
        questionText: zod_1.z.string().min(1, 'Question text is required'),
        optionA: zod_1.z.string().min(1, 'Option A is required'),
        optionB: zod_1.z.string().min(1, 'Option B is required'),
        optionC: zod_1.z.string().optional(),
        optionD: zod_1.z.string().optional(),
        correctOption: zod_1.z.enum(['A', 'B', 'C', 'D']),
        order: zod_1.z.number().int().optional().default(0)
    })
});
exports.submitQuizSchema = zod_1.z.object({
    body: zod_1.z.object({
        answers: zod_1.z.array(zod_1.z.object({
            questionId: zod_1.z.string(),
            selectedOption: zod_1.z.enum(['A', 'B', 'C', 'D'])
        }))
    })
});
//# sourceMappingURL=quizzes.schema.js.map