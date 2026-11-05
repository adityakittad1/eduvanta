/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */
/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export interface TenantInfo {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string;
}
declare global {
    namespace Express {
        interface Request {
            tenant?: TenantInfo;
        }
    }
}
export declare function tenantResolver(req: Request, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=tenantResolver.d.ts.map