"use strict";
// ============================================================
// Public Website Controller
// These endpoints are unauthenticated — public facing.
// Only safe, explicitly public data is returned.
// ============================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolFacilities = exports.getSchoolEvents = exports.getSchoolNotices = exports.getSchoolGallery = exports.getSchoolProfile = exports.getSchoolHome = exports.listSchools = void 0;
const publicService = __importStar(require("./public.service"));
const logger_1 = require("../../lib/logger");
// GET /api/v1/public/schools
async function listSchools(_req, res, _next) {
    try {
        const schools = await publicService.listPublicSchools();
        res.json({ success: true, data: schools });
    }
    catch (error) {
        logger_1.logger.warn('Failed to retrieve public schools from database', { error: error?.message });
        // In production, return safe empty array with 200 rather than crashing public directory
        res.status(200).json({
            success: true,
            data: [],
            warning: 'School directory data temporarily unavailable',
        });
    }
}
exports.listSchools = listSchools;
// GET /api/v1/public/schools/:slug
async function getSchoolHome(req, res, next) {
    try {
        const slug = req.params.slug;
        const schoolId = await publicService.resolvePublicSchool(slug);
        const data = await publicService.getPublicHomePageData(schoolId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
exports.getSchoolHome = getSchoolHome;
// GET /api/v1/public/schools/:slug/profile
async function getSchoolProfile(req, res, next) {
    try {
        const slug = req.params.slug;
        const schoolId = await publicService.resolvePublicSchool(slug);
        const data = await publicService.getPublicSchoolProfile(schoolId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
exports.getSchoolProfile = getSchoolProfile;
// GET /api/v1/public/schools/:slug/gallery
async function getSchoolGallery(req, res, next) {
    try {
        const slug = req.params.slug;
        const category = req.query.category;
        const schoolId = await publicService.resolvePublicSchool(slug);
        const data = await publicService.getPublicGallery(schoolId, category);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
exports.getSchoolGallery = getSchoolGallery;
// GET /api/v1/public/schools/:slug/notices
async function getSchoolNotices(req, res, next) {
    try {
        const slug = req.params.slug;
        const schoolId = await publicService.resolvePublicSchool(slug);
        const data = await publicService.getPublicNotices(schoolId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
exports.getSchoolNotices = getSchoolNotices;
// GET /api/v1/public/schools/:slug/events
async function getSchoolEvents(req, res, next) {
    try {
        const slug = req.params.slug;
        const schoolId = await publicService.resolvePublicSchool(slug);
        const data = await publicService.getPublicEvents(schoolId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
exports.getSchoolEvents = getSchoolEvents;
// GET /api/v1/public/schools/:slug/facilities
async function getSchoolFacilities(req, res, next) {
    try {
        const slug = req.params.slug;
        const schoolId = await publicService.resolvePublicSchool(slug);
        const data = await publicService.getPublicFacilities(schoolId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
exports.getSchoolFacilities = getSchoolFacilities;
//# sourceMappingURL=public.controller.js.map