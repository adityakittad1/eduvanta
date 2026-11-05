/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */
/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare function getTeachers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTeacherById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=teachers.controller.d.ts.map