import { Role } from '@prisma/client';
export interface AuthDbUser {
    id: string;
    email: string;
    name: string | null;
    passwordHash: string;
    role: Role;
    schoolId: string | null;
    isActive: boolean;
    school: {
        id: string;
        name: string;
        logoUrl: string | null;
        isActive: boolean;
        slug: string | null;
    } | null;
    student: {
        id: string;
    } | null;
}
export interface AuthDbUserProfile {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    schoolId: string | null;
    isActive: boolean;
    createdAt: Date;
    school: {
        id: string;
        name: string;
        logoUrl: string | null;
        slug: string | null;
        address: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        principalName: string | null;
        tagline: string | null;
        establishedYear: number | null;
        isPublicEnabled: boolean;
    } | null;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        classId: string | null;
    } | null;
    teacher: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
}
export declare function findUserForLogin(email: string): Promise<AuthDbUser | null>;
export declare function findUserProfileById(userId: string): Promise<AuthDbUserProfile | null>;
export declare function saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
export declare function findValidRefreshTokens(userId: string): Promise<Array<{
    id: string;
    tokenHash: string;
}>>;
export declare function revokeRefreshToken(tokenId: string): Promise<void>;
export declare function revokeAllUserRefreshTokens(userId: string): Promise<void>;
export declare function resolveSchoolBySlug(slug: string): Promise<{
    id: string;
    slug: string;
    name: string;
    logoUrl?: string;
} | null>;
export declare function listPublicSchools(): Promise<any[]>;
//# sourceMappingURL=authDb.d.ts.map