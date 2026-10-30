"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
/**
 * Middleware factory that validates request body/params/query against a Zod schema.
 * Schema should have shape: { body?: ZodObject, params?: ZodObject, query?: ZodObject }
 */
function validateRequest(schema) {
    return (req, _res, next) => {
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
        if (result.data.body)
            req.body = result.data.body;
        if (result.data.params)
            req.params = result.data.params;
        if (result.data.query)
            req.query = result.data.query;
        next();
    };
}
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.js.map