import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { AppError } from '../../middleware/errorHandler';
import { evaluateAllStudents } from './early-warning.service';
import { EvaluateRequestInput } from './early-warning.schema';

export async function getFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.query.classId as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const flags = await prisma.earlyWarningFlag.findMany({
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
      } catch (err) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      let query = supabase
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
        let flags = data.map((row: any) => ({
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
          flags = flags.filter((f: any) => f.student?.classId === classId);
        }

        res.json({ success: true, data: flags });
        return;
      }
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
}

export async function runEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { classId } = req.body as EvaluateRequestInput;

    const evaluatedCount = await evaluateAllStudents(schoolId, classId);

    res.json({ 
      success: true, 
      message: `Successfully evaluated ${evaluatedCount} students.`,
      data: { evaluatedCount }
    });
  } catch (error) {
    next(error);
  }
}
