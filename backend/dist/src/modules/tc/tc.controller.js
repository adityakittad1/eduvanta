"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTcStatus = exports.requestTc = exports.getTcs = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getTcs(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const role = req.user?.role;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        let where = { schoolId };
        if (role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { userId: req.user?.id } });
            if (!student) {
                res.json({ success: true, data: [] });
                return;
            }
            where.studentId = student.id;
        }
        const tcs = await prisma_1.prisma.transferCertificate.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true, division: true } } } },
                approvedBy: { select: { email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: tcs });
    }
    catch (error) {
        next(error);
    }
}
exports.getTcs = getTcs;
async function requestTc(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        let studentId = '';
        if (req.user?.role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { userId: req.user.id } });
            if (!student)
                throw new errorHandler_1.AppError('Student profile not found', 404, 'NOT_FOUND');
            studentId = student.id;
        }
        else {
            // Principal/Teacher requesting on behalf of student
            studentId = data.studentId;
        }
        if (!studentId)
            throw new errorHandler_1.AppError('Student ID is required', 400, 'BAD_REQUEST');
        // Generate unique TC number
        const globalCount = await prisma_1.prisma.transferCertificate.count();
        const tcNumber = `TC-${new Date().getFullYear()}-${String(globalCount + 1).padStart(5, '0')}`;
        const tc = await prisma_1.prisma.transferCertificate.create({
            data: {
                schoolId,
                studentId,
                tcNumber,
                reason: data.reason || null,
                status: 'REQUESTED'
            }
        });
        res.status(201).json({ success: true, data: tc });
    }
    catch (error) {
        next(error);
    }
}
exports.requestTc = requestTc;
async function updateTcStatus(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const tcId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        let updateData = { status: data.status };
        if (data.status === 'APPROVED') {
            updateData.approvedDate = new Date();
            updateData.approvedByUserId = req.user.id;
        }
        else if (data.status === 'ISSUED') {
            updateData.issuedDate = new Date();
            if (data.fileUrl)
                updateData.fileUrl = data.fileUrl;
            // Mark student as inactive if TC is issued
            const tc = await prisma_1.prisma.transferCertificate.findUnique({ where: { id: tcId } });
            if (tc) {
                await prisma_1.prisma.student.update({
                    where: { id: tc.studentId },
                    data: { isActive: false }
                });
            }
        }
        const updatedTc = await prisma_1.prisma.transferCertificate.update({
            where: { id: tcId, schoolId },
            data: updateData
        });
        res.json({ success: true, data: updatedTc });
    }
    catch (error) {
        next(error);
    }
}
exports.updateTcStatus = updateTcStatus;
//# sourceMappingURL=tc.controller.js.map