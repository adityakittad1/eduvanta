"use strict";
// ============================================================
// Public Website Router — No authentication required
// These routes serve the public school website.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const public_controller_1 = require("./public.controller");
exports.publicRouter = (0, express_1.Router)();
// School directory
exports.publicRouter.get('/schools', public_controller_1.listSchools);
// Full home page data (single efficient call)
exports.publicRouter.get('/schools/:slug', public_controller_1.getSchoolHome);
// Individual section endpoints
exports.publicRouter.get('/schools/:slug/profile', public_controller_1.getSchoolProfile);
exports.publicRouter.get('/schools/:slug/gallery', public_controller_1.getSchoolGallery);
exports.publicRouter.get('/schools/:slug/notices', public_controller_1.getSchoolNotices);
exports.publicRouter.get('/schools/:slug/events', public_controller_1.getSchoolEvents);
exports.publicRouter.get('/schools/:slug/facilities', public_controller_1.getSchoolFacilities);
//# sourceMappingURL=public.router.js.map