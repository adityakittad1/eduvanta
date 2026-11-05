"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEvaluation = exports.getFlags = void 0;
const prisma_1 = require("../../lib/prisma");
const supabase_1 = require("../../lib/supabase");
const authDb_1 = require("../../lib/authDb");
const errorHandler_1 = require("../../middleware/errorHandler");
const early_warning_service_1 = require("./early-warning.service");
async function getFlags(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const classId = req.query.classId;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const flags = await prisma_1.prisma.earlyWarningFlag.findMany({
                    where: {
                        schoolId,
                        isResolved: false,
                        ...(classId && { student: { classId } })
                    },
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                admissionNumber: true,
                                class: { select: { name: true, division: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                res.json({ success: true, data: flags });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            let query = supabase_1.supabase
                .from('early_warning_flags')
                .select(`
          id,
          school_id,
          student_id,
          flag_type,
          severity,
          details,
          is_resolved,
          created_at,
          updated_at,
          students (
            id,
            first_name,
            last_name,
            admission_number,
            class_id,
            classes (
              name,
              division
            )
          )
        `)
                .eq('school_id', schoolId)
                .eq('is_resolved', false)
                .order('created_at', { ascending: false });
            const { data, error } = await query;
            if (!error && data) {
                let flags = data.map((row) => ({
                    id: row.id,
                    schoolId: row.school_id,
                    studentId: row.student_id,
                    flagType: row.flag_type,
                    severity: row.severity,
                    details: row.details,
                    isResolved: row.is_resolved,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                    student: row.students ? {
                        id: row.students.id,
                        firstName: row.students.first_name,
                        lastName: row.students.last_name,
                        admissionNumber: row.students.admission_number,
                        class: row.students.classes ? {
                            name: row.students.classes.name,
                            division: row.students.classes.division,
                        } : null
                    } : null
                }));
                if (classId) {
                    flags = flags.filter((f) => f.student?.classId === classId);
                }
                res.json({ success: true, data: flags });
                return;
            }
        }
        res.json({ success: true, data: [] });
    }
    catch (error) {
        next(error);
    }
}
exports.getFlags = getFlags;
async function runEvaluation(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { classId } = req.body;
        const evaluatedCount = await (0, early_warning_service_1.evaluateAllStudents)(schoolId, classId);
        res.json({
            success: true,
            message: `Successfully evaluated ${evaluatedCount} students.`,
            data: { evaluatedCount }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.runEvaluation = runEvaluation;
//# sourceMappingURL=early-warning.controller.js.map