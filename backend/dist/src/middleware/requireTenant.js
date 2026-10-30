"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTenant = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");
function requireTenant(req, _res, next) {
    const hostHeader = req.headers.host;
    if (!hostHeader) {
        return next(new errorHandler_1.AppError('Host header missing', 400, 'BAD_REQUEST'));
    }
    const host = hostHeader.split(':')[0];
    const rootDomain = env_1.env.ROOT_DOMAIN || 'localhost';
    // If request is to the root domain or admin subdomain, skip the requirement
    if (host === rootDomain || host === `admin.${rootDomain}`) {
        return next();
    }
    // tenantResolver should have attached req.tenant; if missing, the request is not scoped to a known school.
    if (!req.tenant) {
        // For API routes (protected), lack of tenant is a configuration error or invalid subdomain.
        return next(new errorHandler_1.AppError('Tenant could not be resolved from subdomain', 400, 'TENANT_RESOLUTION_ERROR'));
    }
    next();
}
exports.requireTenant = requireTenant;
//# sourceMappingURL=requireTenant.js.map