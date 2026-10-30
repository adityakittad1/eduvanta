/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare function getClasses(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getClassById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createClass(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createSubject(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function assignTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function assignStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=classes.controller.d.ts.map