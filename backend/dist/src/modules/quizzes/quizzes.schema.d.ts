import { z } from 'zod';
export declare const createQuizSchema: z.ZodObject<{
    body: z.ZodObject<{
        classId: z.ZodString;
        subjectId: z.ZodString;
        title: z.ZodString;
        topic: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const addQuestionSchema: z.ZodObject<{
    body: z.ZodObject<{
        questionText: z.ZodString;
        optionA: z.ZodString;
        optionB: z.ZodString;
        optionC: z.ZodOptional<z.ZodString>;
        optionD: z.ZodOptional<z.ZodString>;
        correctOption: z.ZodEnum<{
            D: "D";
            A: "A";
            B: "B";
            C: "C";
        }>;
        order: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const submitQuizSchema: z.ZodObject<{
    body: z.ZodObject<{
        answers: z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            selectedOption: z.ZodEnum<{
                D: "D";
                A: "A";
                B: "B";
                C: "C";
            }>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>['body'];
export type AddQuestionInput = z.infer<typeof addQuestionSchema>['body'];
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>['body'];
//# sourceMappingURL=quizzes.schema.d.ts.map