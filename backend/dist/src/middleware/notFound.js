"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
function notFound(req, res, _next) {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        code: 'NOT_FOUND',
    });
}
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map