/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */
interface UserContext {
    userId: string;
    role: string;
    name?: string | null;
    email?: string | null;
}
/**
 * Pre-fetches strictly authorized school data to ground the AI response.
 * Database credentials or raw SQL execution are NEVER passed to the LLM.
 */
export declare function getAuthorizedContext(schoolId: string, user: UserContext): Promise<{
    school: {
        name: string;
        _count: {
            students: number;
            teachers: number;
            classes: number;
        };
        address: string | null;
        principalName: string | null;
        tagline: string | null;
        establishedYear: number | null;
        classes: {
            id: string;
            name: string;
            academicYear: string;
            division: string | null;
        }[];
        notices: {
            title: string;
            content: string;
            publishedAt: Date | null;
        }[];
        facilities: {
            name: string;
            description: string | null;
        }[];
        events: {
            description: string | null;
            title: string;
            eventDate: Date;
        }[];
    };
    students: any[];
    teachers: any[];
    warnings: any[];
} | {
    school: {
        name: any;
        tagline: any;
        address: any;
        principalName: any;
        establishedYear: any;
        _count: {
            students: number;
            teachers: number;
            classes: number;
        };
        classes: {
            id: any;
            name: any;
            division: any;
            academicYear: any;
        }[];
        events: {
            title: any;
            eventDate: any;
            description: any;
        }[];
        notices: {
            title: any;
            content: any;
            publishedAt: any;
        }[];
        facilities: {
            name: any;
            description: any;
        }[];
    };
    students: {
        id: any;
        firstName: any;
        lastName: any;
        admissionNumber: any;
        guardianName: any;
        guardianPhone: any;
        class: {
            name: any;
            division: any;
        } | null;
    }[];
    teachers: {
        id: any;
        firstName: any;
        lastName: any;
        employeeId: any;
        qualification: any;
    }[];
    warnings: {
        flagType: any;
        details: any;
        student: {
            firstName: any;
            lastName: any;
        } | null;
    }[];
} | null>;
/**
 * Main AI query processor.
 */
export declare function processAiPrompt(prompt: string, schoolId: string, user: UserContext): Promise<string>;
export {};
//# sourceMappingURL=ai.service.d.ts.map