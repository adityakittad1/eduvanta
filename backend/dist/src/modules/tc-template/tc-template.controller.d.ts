/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function uploadTemplate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function activateTemplate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function archiveTemplate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function generateTc(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=tc-template.controller.d.ts.map