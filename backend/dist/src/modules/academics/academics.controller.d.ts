/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare function createAssessment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAssessments(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAssessmentById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function saveMarks(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getMarksForAssessment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getStudentAcademics(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=academics.controller.d.ts.map