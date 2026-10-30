/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare function getQuizzes(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getQuizById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createQuiz(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addQuestion(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function publishQuiz(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function submitQuiz(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=quizzes.controller.d.ts.map