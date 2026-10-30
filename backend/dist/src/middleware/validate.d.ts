import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape } from 'zod';
/**
 * Middleware factory that validates request body/params/query against a Zod schema.
 * Schema should have shape: { body?: ZodObject, params?: ZodObject, query?: ZodObject }
 */
export declare function validateRequest(schema: ZodObject<ZodRawShape>): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map