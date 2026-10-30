/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    schoolId: string | null;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logout(req: Request, res: Response): Promise<void>;
export declare function refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function requireRole(...roles: Role[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireSchool(req: Request, _res: Response, next: NextFunction): void;
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map