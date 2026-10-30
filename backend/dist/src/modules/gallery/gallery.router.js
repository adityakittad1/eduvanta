"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.galleryRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const gallery_schema_1 = require("./gallery.schema");
const gallery_controller_1 = require("./gallery.controller");
exports.galleryRouter = (0, express_1.Router)();
exports.galleryRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
exports.galleryRouter.get('/', gallery_controller_1.getGalleryItems);
exports.galleryRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(gallery_schema_1.createGalleryItemSchema), gallery_controller_1.uploadGalleryItem);
exports.galleryRouter.patch('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), gallery_controller_1.updateGalleryItem);
//# sourceMappingURL=gallery.router.js.map