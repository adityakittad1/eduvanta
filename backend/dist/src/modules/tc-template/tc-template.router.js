"use strict";
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
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const tcTemplateController = __importStar(require("./tc-template.controller"));
const router = (0, express_1.Router)();
router.use(auth_controller_1.authenticate);
// Only Principals can manage TC templates
router.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL'), tcTemplateController.getTemplates);
router.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL'), tcTemplateController.uploadTemplate);
router.patch('/:id/activate', (0, auth_controller_1.requireRole)('PRINCIPAL'), tcTemplateController.activateTemplate);
router.patch('/:id/archive', (0, auth_controller_1.requireRole)('PRINCIPAL'), tcTemplateController.archiveTemplate);
// Generate TC (Principal generates TC for a student)
router.post('/generate/:tcId', (0, auth_controller_1.requireRole)('PRINCIPAL'), tcTemplateController.generateTc);
exports.default = router;
//# sourceMappingURL=tc-template.router.js.map