import { z } from 'zod';
export declare const createGalleryItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<{
            INFRASTRUCTURE: "INFRASTRUCTURE";
            EVENTS: "EVENTS";
            ACTIVITIES: "ACTIVITIES";
            SPORTS: "SPORTS";
            ACHIEVEMENTS: "ACHIEVEMENTS";
            CULTURAL: "CULTURAL";
            EDUCATIONAL: "EDUCATIONAL";
        }>;
        fileUrl: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=gallery.schema.d.ts.map