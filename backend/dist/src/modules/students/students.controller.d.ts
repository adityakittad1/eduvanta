/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */
/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare function getStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getStudentById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=students.controller.d.ts.map