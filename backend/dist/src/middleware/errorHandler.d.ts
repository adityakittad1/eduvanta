/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    constructor(message: string, statusCode: number, code: string, isOperational?: boolean);
}
export declare const Errors: {
    unauthorized: (message?: string) => AppError;
    forbidden: (message?: string) => AppError;
    notFound: (resource?: string) => AppError;
    conflict: (message: string) => AppError;
    badRequest: (message: string) => AppError;
    internal: (message?: string) => AppError;
};
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map