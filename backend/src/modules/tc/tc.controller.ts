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

export async function getTcs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const role = req.user?.role;
    
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        let where: any = { schoolId };

        if (role === 'STUDENT') {
          const student = await prisma.student.findUnique({ where: { userId: req.user?.id } });
          if (!student) {
            res.json({ success: true, data: [] });
            return;
          }
          where.studentId = student.id;
        }

        const tcs = await prisma.transferCertificate.findMany({
          where,
          include: {
            student: { select: { firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true, division: true } } } },
            approvedBy: { select: { email: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: tcs });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    // Supabase fallback
    if (supabase) {
      let studentIdFilter: string | null = null;
      if (role === 'STUDENT') {
        const { data: s } = await supabase.from('students').select('id').eq('user_id', req.user?.id).maybeSingle();
        if (!s) {
          res.json({ success: true, data: [] });
          return;
        }
        studentIdFilter = s.id;
      }

      let query = supabase
        .from('transfer_certificates')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (studentIdFilter) {
        query = query.eq('student_id', studentIdFilter);
      }

      const { data: tcRows, error: tcErr } = await query;
      if (tcErr) throw new AppError('Failed to fetch TCs: ' + tcErr.message, 500, 'INTERNAL_ERROR');

      const studentIds = Array.from(new Set((tcRows || []).map(r => r.student_id).filter(Boolean)));
      let studentMap = new Map<string, any>();
      if (studentIds.length > 0) {
        const { data: studentRows } = await supabase
          .from('students')
          .select('id, first_name, last_name, admission_number, class_id')
          .in('id', studentIds);

        const classIds = Array.from(new Set((studentRows || []).map(sr => sr.class_id).filter(Boolean)));
        let classMap = new Map<string, any>();
        if (classIds.length > 0) {
          const { data: classRows } = await supabase
            .from('classes')
            .select('id, name, division')
            .in('id', classIds);
          (classRows || []).forEach(c => classMap.set(c.id, c));
        }

        (studentRows || []).forEach(sr => {
          const cls = sr.class_id ? classMap.get(sr.class_id) : null;
          studentMap.set(sr.id, {
            firstName: sr.first_name,
            lastName: sr.last_name,
            admissionNumber: sr.admission_number,
            class: cls ? { name: cls.name, division: cls.division } : null
          });
        });
      }

      const mapped = (tcRows || []).map(tc => ({
        id: tc.id,
        schoolId: tc.school_id,
        studentId: tc.student_id,
        tcNumber: tc.tc_number,
        reason: tc.reason,
        status: tc.status,
        fileUrl: tc.file_url,
        approvedDate: tc.approved_date,
        issuedDate: tc.issued_date,
        createdAt: tc.created_at,
        student: studentMap.get(tc.student_id) || { firstName: 'Student', lastName: '', admissionNumber: 'N/A', class: null },
        approvedBy: tc.approved_by_user_id ? { email: 'principal@school.eduvanta' } : null
      }));

      res.json({ success: true, data: mapped });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function requestTc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;
    let studentId = '';

    if (isPrismaAvailable()) {
      try {
        if (req.user?.role === 'STUDENT') {
          const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
          if (!student) throw new AppError('Student profile not found', 404, 'NOT_FOUND');
          studentId = student.id;
        } else {
          studentId = data.studentId;
        }

        if (!studentId) throw new AppError('Student ID is required', 400, 'BAD_REQUEST');

        // Generate unique TC number
        const globalCount = await prisma.transferCertificate.count();
        const tcNumber = `TC-${new Date().getFullYear()}-${String(globalCount + 1).padStart(5, '0')}`;

        const tc = await prisma.transferCertificate.create({
          data: {
            schoolId,
            studentId,
            tcNumber,
            reason: data.reason || null,
            status: 'REQUESTED'
          }
        });

        res.status(201).json({ success: true, data: tc });
        return;
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        markPrismaFailure();
      }
    }

    // Supabase fallback
    if (supabase) {
      if (req.user?.role === 'STUDENT') {
        const { data: s } = await supabase.from('students').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!s) throw new AppError('Student profile not found', 404, 'NOT_FOUND');
        studentId = s.id;
      } else {
        studentId = data.studentId;
      }

      if (!studentId) throw new AppError('Student ID is required', 400, 'BAD_REQUEST');

      const { count } = await supabase.from('transfer_certificates').select('id', { count: 'exact', head: true });
      const currentCount = count || 0;
      const tcNumber = `TC-${new Date().getFullYear()}-${String(currentCount + 1).padStart(5, '0')}`;
      const tcId = generateCuid();
      const nowIso = new Date().toISOString();

      const { data: newTc, error: insertErr } = await supabase.from('transfer_certificates').insert({
        id: tcId,
        school_id: schoolId,
        student_id: studentId,
        tc_number: tcNumber,
        reason: data.reason || null,
        status: 'REQUESTED',
        created_at: nowIso,
        updated_at: nowIso
      }).select().single();

      if (insertErr) throw new AppError('Failed to create TC: ' + insertErr.message, 500, 'INTERNAL_ERROR');

      res.status(201).json({
        success: true,
        data: {
          id: newTc.id,
          schoolId: newTc.school_id,
          studentId: newTc.student_id,
          tcNumber: newTc.tc_number,
          reason: newTc.reason,
          status: newTc.status,
          createdAt: newTc.created_at
        }
      });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function updateTcStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const tcId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;
    
    if (isPrismaAvailable()) {
      try {
        let updateData: any = { status: data.status };
        if (data.status === 'APPROVED') {
          updateData.approvedDate = new Date();
          updateData.approvedByUserId = req.user!.id;
        } else if (data.status === 'ISSUED') {
          updateData.issuedDate = new Date();
          if (data.fileUrl) updateData.fileUrl = data.fileUrl;
          
          const tc = await prisma.transferCertificate.findUnique({ where: { id: tcId } });
          if (tc) {
            await prisma.student.update({
              where: { id: tc.studentId },
              data: { isActive: false }
            });
          }
        }

        const updatedTc = await prisma.transferCertificate.update({
          where: { id: tcId, schoolId },
          data: updateData
        });

        res.json({ success: true, data: updatedTc });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    // Supabase fallback
    if (supabase) {
      const nowIso = new Date().toISOString();
      let updatePayload: any = { status: data.status, updated_at: nowIso };

      if (data.status === 'APPROVED') {
        updatePayload.approved_date = nowIso;
        updatePayload.approved_by_user_id = req.user!.id;
      } else if (data.status === 'ISSUED') {
        updatePayload.issued_date = nowIso;
        if (data.fileUrl) updatePayload.file_url = data.fileUrl;

        const { data: tc } = await supabase.from('transfer_certificates').select('student_id').eq('id', tcId).maybeSingle();
        if (tc?.student_id) {
          await supabase.from('students').update({ is_active: false }).eq('id', tc.student_id);
        }
      }

      const { data: updatedTc, error: updateErr } = await supabase
        .from('transfer_certificates')
        .update(updatePayload)
        .eq('id', tcId)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (updateErr) throw new AppError('Failed to update TC: ' + updateErr.message, 500, 'INTERNAL_ERROR');

      res.json({
        success: true,
        data: {
          id: updatedTc.id,
          schoolId: updatedTc.school_id,
          studentId: updatedTc.student_id,
          tcNumber: updatedTc.tc_number,
          reason: updatedTc.reason,
          status: updatedTc.status,
          fileUrl: updatedTc.file_url,
          approvedDate: updatedTc.approved_date,
          issuedDate: updatedTc.issued_date
        }
      });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}
