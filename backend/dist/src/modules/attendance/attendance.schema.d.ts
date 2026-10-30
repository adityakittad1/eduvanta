import { z } from 'zod';
export declare const markAttendanceSchema: z.ZodObject<{
    body: z.ZodObject<{
        classId: z.ZodString;
        date: z.ZodString;
        records: z.ZodArray<z.ZodObject<{
            studentId: z.ZodString;
            status: z.ZodEnum<{
                PRESENT: "PRESENT";
                ABSENT: "ABSENT";
                LATE: "LATE";
                HOLIDAY: "HOLIDAY";
            }>;
            remarks: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>['body'];
//# sourceMappingURL=attendance.schema.d.ts.map