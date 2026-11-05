/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */
/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare function getAllSchools(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSchoolById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createSchool(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateSchool(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=schools.controller.d.ts.map