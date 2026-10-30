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
        _count: {
            students: number;
            teachers: number;
            classes: number;
        };
    };
    students: any[];
    teachers: any[];
    warnings: any[];
} | null>;
/**
 * Main AI query processor.
 */
export declare function processAiPrompt(prompt: string, schoolId: string, user: UserContext): Promise<string>;
export {};
//# sourceMappingURL=ai.service.d.ts.map