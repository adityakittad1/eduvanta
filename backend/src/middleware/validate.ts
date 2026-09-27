import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape } from 'zod';

/**
 * Middleware factory that validates request body/params/query against a Zod schema.
 * Schema should have shape: { body?: ZodObject, params?: ZodObject, query?: ZodObject }
 */
export function validateRequest(schema: ZodObject<ZodRawShape>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
    });

    if (!result.success) {
      next(result.error); // ZodError — handled by errorHandler
      return;
    }

    // Merge validated data back onto request
    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.params = result.data.params as Record<string, string>;
    if (result.data.query) req.query = result.data.query as Record<string, string>;

    next();
  };
}
