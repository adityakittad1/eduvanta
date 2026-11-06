/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { generateCuid } from '../../lib/dataDb';
import { AppError } from '../../middleware/errorHandler';
import { CreateAssessmentInput, SaveMarksInput } from './academics.schema';

export async function createAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as CreateAssessmentInput;

    if (isPrismaAvailable()) {
      try {
        const assessment = await prisma.assessment.create({
          data: {
            schoolId,
            classId: data.classId,
            subjectId: data.subjectId,
            name: data.name,
            type: data.type,
            maxMarks: data.maxMarks,
            conductedDate: data.conductedDate ? new Date(data.conductedDate) : null,
            academicYear: data.academicYear
          }
        });

        res.status(201).json({ success: true, data: assessment });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const assessmentId = generateCuid();
      const nowIso = new Date().toISOString();

      const { data: newRow, error: insertErr } = await supabase.from('assessments').insert({
        id: assessmentId,
        school_id: schoolId,
        class_id: data.classId,
        subject_id: data.subjectId,
        name: data.name,
        type: data.type,
        max_marks: data.maxMarks,
        conducted_date: data.conductedDate ? new Date(data.conductedDate).toISOString() : null,
        academic_year: data.academicYear,
        created_at: nowIso,
        updated_at: nowIso
      }).select().single();

      if (insertErr) throw new AppError('Failed to create assessment: ' + insertErr.message, 500, 'INTERNAL_ERROR');

      res.status(201).json({
        success: true,
        data: {
          id: newRow.id,
          schoolId: newRow.school_id,
          classId: newRow.class_id,
          subjectId: newRow.subject_id,
          name: newRow.name,
          type: newRow.type,
          maxMarks: newRow.max_marks,
          conductedDate: newRow.conducted_date,
          academicYear: newRow.academic_year
        }
      });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function getAssessments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.query.classId as string;
    const subjectId = req.query.subjectId as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const assessments = await prisma.assessment.findMany({
          where: {
            schoolId,
            ...(classId && { classId }),
            ...(subjectId && { subjectId })
          },
          include: {
            class: { select: { name: true, division: true } },
            subject: { select: { name: true } },
            _count: { select: { academicRecords: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: assessments });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      let query = supabase
        .from('assessments')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (classId) query = query.eq('class_id', classId);
      if (subjectId) query = query.eq('subject_id', subjectId);

      const { data: rows, error: aErr } = await query;
      if (aErr) throw new AppError('Failed to load assessments: ' + aErr.message, 500, 'INTERNAL_ERROR');

      const classIds = Array.from(new Set((rows || []).map(r => r.class_id).filter(Boolean)));
      const subjectIds = Array.from(new Set((rows || []).map(r => r.subject_id).filter(Boolean)));
      const assessmentIds = (rows || []).map(r => r.id);

      let classMap = new Map<string, any>();
      let subjectMap = new Map<string, any>();
      let recordsCountMap = new Map<string, number>();

      if (classIds.length > 0) {
        const { data: cRows } = await supabase.from('classes').select('id, name, division').in('id', classIds);
        (cRows || []).forEach(c => classMap.set(c.id, c));
      }

      if (subjectIds.length > 0) {
        const { data: sRows } = await supabase.from('subjects').select('id, name').in('id', subjectIds);
        (sRows || []).forEach(s => subjectMap.set(s.id, s));
      }

      if (assessmentIds.length > 0) {
        const { data: rRows } = await supabase.from('academic_records').select('assessment_id').in('assessment_id', assessmentIds);
        (rRows || []).forEach(r => {
          recordsCountMap.set(r.assessment_id, (recordsCountMap.get(r.assessment_id) || 0) + 1);
        });
      }

      const mapped = (rows || []).map(row => {
        const c = classMap.get(row.class_id);
        const s = subjectMap.get(row.subject_id);
        return {
          id: row.id,
          schoolId: row.school_id,
          classId: row.class_id,
          subjectId: row.subject_id,
          name: row.name,
          type: row.type,
          maxMarks: row.max_marks,
          conductedDate: row.conducted_date,
          academicYear: row.academic_year,
          createdAt: row.created_at,
          class: c ? { name: c.name, division: c.division } : null,
          subject: s ? { name: s.name } : null,
          _count: { academicRecords: recordsCountMap.get(row.id) || 0 }
        };
      });

      res.json({ success: true, data: mapped });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function getAssessmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const assessmentId = req.params.id as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const assessment = await prisma.assessment.findUnique({
          where: { id: assessmentId },
          include: {
            class: { select: { name: true, division: true } },
            subject: { select: { name: true } }
          }
        });
        if (assessment && assessment.schoolId === schoolId) {
          res.json({ success: true, data: assessment });
          return;
        }
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data: row, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (error || !row) throw new AppError('Assessment not found', 404, 'NOT_FOUND');

      let classInfo: any = null;
      let subjectInfo: any = null;

      if (row.class_id) {
        const { data: c } = await supabase.from('classes').select('name, division').eq('id', row.class_id).maybeSingle();
        classInfo = c;
      }
      if (row.subject_id) {
        const { data: s } = await supabase.from('subjects').select('name').eq('id', row.subject_id).maybeSingle();
        subjectInfo = s;
      }

      res.json({
        success: true,
        data: {
          id: row.id,
          schoolId: row.school_id,
          classId: row.class_id,
          subjectId: row.subject_id,
          name: row.name,
          type: row.type,
          maxMarks: row.max_marks,
          conductedDate: row.conducted_date,
          academicYear: row.academic_year,
          createdAt: row.created_at,
          class: classInfo,
          subject: subjectInfo
        }
      });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function saveMarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const assessmentId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { records } = req.body as SaveMarksInput;

    if (isPrismaAvailable()) {
      try {
        const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
        if (!assessment || assessment.schoolId !== schoolId) {
          throw new AppError('Assessment not found', 404, 'NOT_FOUND');
        }

        const upserts = records.map(record => {
          if (record.marksObtained > assessment.maxMarks) {
            throw new AppError(`Marks obtained cannot exceed max marks for student ${record.studentId}`, 400, 'BAD_REQUEST');
          }

          return prisma.academicRecord.upsert({
            where: {
              studentId_assessmentId: {
                studentId: record.studentId,
                assessmentId: assessmentId
              }
            },
            update: {
              marksObtained: record.marksObtained,
              remarks: record.remarks || null
            },
            create: {
              schoolId,
              studentId: record.studentId,
              assessmentId: assessmentId,
              marksObtained: record.marksObtained,
              remarks: record.remarks || null
            }
          });
        });

        await prisma.$transaction(upserts);
        res.json({ success: true, message: `Successfully saved marks for ${records.length} students` });
        return;
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data: assessment } = await supabase.from('assessments').select('*').eq('id', assessmentId).eq('school_id', schoolId).maybeSingle();
      if (!assessment) throw new AppError('Assessment not found', 404, 'NOT_FOUND');

      const nowIso = new Date().toISOString();
      const upsertPayload = records.map(r => {
        if (r.marksObtained > assessment.max_marks) {
          throw new AppError(`Marks obtained cannot exceed max marks for student ${r.studentId}`, 400, 'BAD_REQUEST');
        }
        return {
          id: generateCuid(),
          school_id: schoolId,
          student_id: r.studentId,
          assessment_id: assessmentId,
          marks_obtained: r.marksObtained,
          remarks: r.remarks || null,
          created_at: nowIso,
          updated_at: nowIso
        };
      });

      const { error: upsertErr } = await supabase.from('academic_records').upsert(upsertPayload, {
        onConflict: 'student_id,assessment_id'
      });

      if (upsertErr) throw new AppError('Failed to save marks: ' + upsertErr.message, 500, 'INTERNAL_ERROR');

      res.json({ success: true, message: `Successfully saved marks for ${records.length} students` });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function getMarksForAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const assessmentId = req.params.id as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const marks = await prisma.academicRecord.findMany({
          where: {
            schoolId,
            assessmentId
          }
        });

        res.json({ success: true, data: marks });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data: rows, error } = await supabase
        .from('academic_records')
        .select('*')
        .eq('school_id', schoolId)
        .eq('assessment_id', assessmentId);

      if (error) throw new AppError('Failed to load marks: ' + error.message, 500, 'INTERNAL_ERROR');

      const mapped = (rows || []).map(r => ({
        id: r.id,
        schoolId: r.school_id,
        studentId: r.student_id,
        assessmentId: r.assessment_id,
        marksObtained: r.marks_obtained,
        remarks: r.remarks
      }));

      res.json({ success: true, data: mapped });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function getStudentAcademics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const studentId = req.params.studentId as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        if (req.user?.role === 'STUDENT') {
          const student = await prisma.student.findUnique({ where: { id: studentId } });
          if (student?.userId !== req.user.id) {
            throw new AppError('Forbidden', 403, 'FORBIDDEN');
          }
        }

        const records = await prisma.academicRecord.findMany({
          where: { schoolId, studentId },
          include: {
            assessment: {
              include: { subject: { select: { name: true } } }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        let totalMarksObtained = 0;
        let totalMaxMarks = 0;

        records.forEach(r => {
          totalMarksObtained += r.marksObtained;
          totalMaxMarks += r.assessment.maxMarks;
        });

        const averagePercentage = totalMaxMarks > 0 
          ? Math.round((totalMarksObtained / totalMaxMarks) * 100) 
          : null;

        res.json({
          success: true,
          data: {
            averagePercentage,
            records
          }
        });
        return;
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        markPrismaFailure();
      }
    }

    if (supabase) {
      if (req.user?.role === 'STUDENT') {
        const { data: s } = await supabase.from('students').select('user_id').eq('id', studentId).maybeSingle();
        if (s?.user_id !== req.user.id) throw new AppError('Forbidden', 403, 'FORBIDDEN');
      }

      const { data: rRows, error: rErr } = await supabase
        .from('academic_records')
        .select('*')
        .eq('school_id', schoolId)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (rErr) throw new AppError('Failed to load academic records: ' + rErr.message, 500, 'INTERNAL_ERROR');

      const assessmentIds = Array.from(new Set((rRows || []).map(r => r.assessment_id).filter(Boolean)));
      let assessmentMap = new Map<string, any>();

      if (assessmentIds.length > 0) {
        const { data: aRows } = await supabase.from('assessments').select('*').in('id', assessmentIds);
        const subjectIds = Array.from(new Set((aRows || []).map(a => a.subject_id).filter(Boolean)));
        let subjectMap = new Map<string, any>();

        if (subjectIds.length > 0) {
          const { data: sRows } = await supabase.from('subjects').select('id, name').in('id', subjectIds);
          (sRows || []).forEach(s => subjectMap.set(s.id, s));
        }

        (aRows || []).forEach(a => {
          const s = subjectMap.get(a.subject_id);
          assessmentMap.set(a.id, {
            id: a.id,
            name: a.name,
            type: a.type,
            maxMarks: a.max_marks,
            subject: s ? { name: s.name } : null
          });
        });
      }

      let totalMarksObtained = 0;
      let totalMaxMarks = 0;

      const records = (rRows || []).map(r => {
        const a = assessmentMap.get(r.assessment_id) || { name: 'Assessment', type: 'UNIT_TEST', maxMarks: 100, subject: null };
        totalMarksObtained += r.marks_obtained;
        totalMaxMarks += a.maxMarks;

        return {
          id: r.id,
          marksObtained: r.marks_obtained,
          remarks: r.remarks,
          assessment: a
        };
      });

      const averagePercentage = totalMaxMarks > 0 
        ? Math.round((totalMarksObtained / totalMaxMarks) * 100) 
        : null;

      res.json({
        success: true,
        data: {
          averagePercentage,
          records
        }
      });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}
