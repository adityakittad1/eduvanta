"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTc = exports.archiveTemplate = exports.activateTemplate = exports.uploadTemplate = exports.getTemplates = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const supabase_1 = require("../../lib/supabase");
async function getTemplates(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const templates = await prisma_1.prisma.tcTemplate.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: templates });
    }
    catch (error) {
        next(error);
    }
}
exports.getTemplates = getTemplates;
async function uploadTemplate(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { name, fileUrl } = req.body;
        if (!fileUrl || !fileUrl.endsWith('.docx')) {
            throw new errorHandler_1.AppError('A valid DOCX fileUrl is required', 400, 'BAD_REQUEST');
        }
        // Determine next version
        const count = await prisma_1.prisma.tcTemplate.count({ where: { schoolId } });
        const version = count + 1;
        // Archive all other templates when uploading a new one? No, user manually activates.
        const template = await prisma_1.prisma.tcTemplate.create({
            data: {
                schoolId,
                name: name || `Template v${version}`,
                version,
                fileUrl,
                status: 'ARCHIVED',
                createdBy: req.user.id
            }
        });
        res.status(201).json({ success: true, data: template });
    }
    catch (error) {
        next(error);
    }
}
exports.uploadTemplate = uploadTemplate;
async function activateTemplate(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const templateId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.tcTemplate.updateMany({
                where: { schoolId, status: 'ACTIVE' },
                data: { status: 'ARCHIVED' }
            }),
            prisma_1.prisma.tcTemplate.update({
                where: { id: templateId, schoolId },
                data: { status: 'ACTIVE', activatedAt: new Date() }
            })
        ]);
        res.json({ success: true, message: 'Template activated successfully' });
    }
    catch (error) {
        next(error);
    }
}
exports.activateTemplate = activateTemplate;
async function archiveTemplate(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const templateId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        await prisma_1.prisma.tcTemplate.update({
            where: { id: templateId, schoolId },
            data: { status: 'ARCHIVED' }
        });
        res.json({ success: true, message: 'Template archived successfully' });
    }
    catch (error) {
        next(error);
    }
}
exports.archiveTemplate = archiveTemplate;
async function generateTc(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const tcId = req.params.tcId;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        // 1. Get the requested TC and student info
        const tc = await prisma_1.prisma.transferCertificate.findUnique({
            where: { id: tcId, schoolId },
            include: {
                student: {
                    include: { class: true }
                }
            }
        });
        if (!tc)
            throw new errorHandler_1.AppError('TC Request not found', 404, 'NOT_FOUND');
        if (tc.status !== 'APPROVED')
            throw new errorHandler_1.AppError('TC Request must be approved first', 400, 'BAD_REQUEST');
        // 2. Get school info
        const school = await prisma_1.prisma.school.findUnique({ where: { id: schoolId } });
        if (!school)
            throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
        // 3. Get active template or fallback
        let template = await prisma_1.prisma.tcTemplate.findFirst({
            where: { schoolId, status: 'ACTIVE' }
        });
        let content;
        if (template && template.fileUrl) {
            if (template.fileUrl.startsWith('http')) {
                // Remote URL (Supabase)
                const response = await fetch(template.fileUrl);
                if (!response.ok) {
                    throw new errorHandler_1.AppError('Failed to fetch template from storage', 500, 'INTERNAL_SERVER_ERROR');
                }
                const arrayBuffer = await response.arrayBuffer();
                content = Buffer.from(arrayBuffer);
            }
            else {
                // Local URL fallback
                const filePath = path_1.default.join(__dirname, '../../..', template.fileUrl);
                if (!fs_1.default.existsSync(filePath)) {
                    throw new errorHandler_1.AppError('Template file is missing from server', 500, 'INTERNAL_SERVER_ERROR');
                }
                content = fs_1.default.readFileSync(filePath);
            }
        }
        else {
            // Fallback to global default template
            const defaultPath = path_1.default.join(__dirname, '../../../public', 'default-tc-template.docx');
            if (!fs_1.default.existsSync(defaultPath)) {
                throw new errorHandler_1.AppError('No TC template available (missing default)', 400, 'BAD_REQUEST');
            }
            content = fs_1.default.readFileSync(defaultPath);
        }
        const zip = new pizzip_1.default(content);
        const doc = new docxtemplater_1.default(zip, { paragraphLoop: true, linebreaks: true });
        // 5. Populate Data
        const data = {
            student_name: `${tc.student.firstName} ${tc.student.lastName}`,
            father_name: tc.student.guardianName || '',
            mother_name: '', // We don't have mother name in schema natively, so leave empty or use guardian
            date_of_birth: tc.student.dateOfBirth ? tc.student.dateOfBirth.toLocaleDateString() : '',
            admission_number: tc.student.admissionNumber,
            date_of_admission: tc.student.enrollmentDate ? tc.student.enrollmentDate.toLocaleDateString() : '',
            date_of_leaving: new Date().toLocaleDateString(),
            class: tc.student.class?.name || '',
            section: tc.student.class?.division || '',
            reason_for_leaving: tc.reason || '',
            conduct: 'Good',
            remarks: 'N/A',
            school_name: school.name,
            school_address: school.address || '',
            principal_name: school.principalName || ''
        };
        doc.render(data);
        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        // 6. Save the generated document
        const generatedFilename = `TC_${tc.student.admissionNumber}_${Date.now()}.docx`;
        let generatedFileUrl = '';
        if (supabase_1.supabase) {
            const filePath = `${schoolId}/${generatedFilename}`;
            const { error } = await supabase_1.supabase.storage.from('eduvanta-assets').upload(filePath, buf, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            if (error)
                throw new errorHandler_1.AppError('Failed to upload generated TC to Supabase', 500, 'INTERNAL_SERVER_ERROR');
            const { data: publicUrlData } = supabase_1.supabase.storage.from('eduvanta-assets').getPublicUrl(filePath);
            generatedFileUrl = publicUrlData.publicUrl;
        }
        else {
            const generatedPath = path_1.default.join(__dirname, '../../../uploads', generatedFilename);
            fs_1.default.writeFileSync(generatedPath, buf);
            generatedFileUrl = `/uploads/${generatedFilename}`;
        }
        // 7. Update the TC record
        const updatedTc = await prisma_1.prisma.transferCertificate.update({
            where: { id: tc.id },
            data: {
                templateId: template?.id || null,
                templateVersion: template?.version || 1,
                fileUrl: generatedFileUrl,
                status: 'ISSUED',
                issuedDate: new Date()
            }
        });
        // 8. Mark student inactive
        await prisma_1.prisma.student.update({
            where: { id: tc.studentId },
            data: { isActive: false }
        });
        res.json({ success: true, data: updatedTc });
    }
    catch (error) {
        next(error);
    }
}
exports.generateTc = generateTc;
//# sourceMappingURL=tc-template.controller.js.map