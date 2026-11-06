/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */

import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { generateCuid } from '../../lib/dataDb';
import { WarningType } from '@prisma/client';
import { logger } from '../../lib/logger';

const ATTENDANCE_THRESHOLD = 75; // below 75% triggers a warning
const ACADEMICS_THRESHOLD = 40;  // below 40% average triggers a warning

export async function evaluateStudent(studentId: string, schoolId: string): Promise<void> {
  let attendancePercentage: number | null = null;
  let academicPercentage: number | null = null;

  if (isPrismaAvailable()) {
    try {
      // 1. Evaluate Attendance
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId, schoolId, status: { in: ['PRESENT', 'ABSENT', 'LATE'] } }
      });

      let totalDays = 0;
      let presentDays = 0;
      attendanceRecords.forEach(r => {
        totalDays++;
        if (r.status === 'PRESENT' || r.status === 'LATE') presentDays++;
      });
      attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : null;

      // 2. Evaluate Academics
      const academicRecords = await prisma.academicRecord.findMany({
        where: { studentId, schoolId },
        include: { assessment: true }
      });

      let totalMarksObtained = 0;
      let totalMaxMarks = 0;
      academicRecords.forEach(r => {
        totalMarksObtained += r.marksObtained;
        totalMaxMarks += r.assessment.maxMarks;
      });
      academicPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : null;
    } catch {
      markPrismaFailure();
    }
  }

  // Supabase fallback for metrics calculation
  if ((attendancePercentage === null || academicPercentage === null) && supabase) {
    try {
      const { data: attRows } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .in('status', ['PRESENT', 'ABSENT', 'LATE']);

      if (attRows && attRows.length > 0) {
        const total = attRows.length;
        const present = attRows.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
        attendancePercentage = (present / total) * 100;
      }

      const { data: recRows } = await supabase
        .from('academic_records')
        .select('marks_obtained, assessments ( max_marks )')
        .eq('student_id', studentId)
        .eq('school_id', schoolId);

      if (recRows && recRows.length > 0) {
        let obtained = 0;
        let max = 0;
        recRows.forEach((r: any) => {
          obtained += r.marks_obtained;
          max += r.assessments?.max_marks || 100;
        });
        academicPercentage = max > 0 ? (obtained / max) * 100 : null;
      }
    } catch (sbErr: any) {
      logger.error('Supabase evaluateStudent metrics failed', { error: sbErr?.message });
    }
  }

  await manageFlag(
    schoolId,
    studentId,
    'LOW_ATTENDANCE' as WarningType,
    attendancePercentage !== null && attendancePercentage < ATTENDANCE_THRESHOLD,
    { threshold: ATTENDANCE_THRESHOLD, actual: attendancePercentage ? Math.round(attendancePercentage) : 0 }
  );

  await manageFlag(
    schoolId,
    studentId,
    'LOW_ACADEMIC_PERFORMANCE' as WarningType,
    academicPercentage !== null && academicPercentage < ACADEMICS_THRESHOLD,
    { threshold: ACADEMICS_THRESHOLD, actual: academicPercentage ? Math.round(academicPercentage) : 0 }
  );
}

async function manageFlag(schoolId: string, studentId: string, flagType: WarningType, shouldFlag: boolean, details: any) {
  if (isPrismaAvailable()) {
    try {
      const existingFlag = await prisma.earlyWarningFlag.findFirst({
        where: { schoolId, studentId, flagType, isResolved: false }
      });

      if (shouldFlag) {
        if (!existingFlag) {
          await prisma.earlyWarningFlag.create({
            data: { schoolId, studentId, flagType, details }
          });
          logger.info(`Generated ${flagType} flag for student ${studentId}`);
        } else {
          await prisma.earlyWarningFlag.update({
            where: { id: existingFlag.id },
            data: { details }
          });
        }
      } else if (existingFlag) {
        await prisma.earlyWarningFlag.update({
          where: { id: existingFlag.id },
          data: {
            isResolved: true,
            resolvedAt: new Date(),
            details: { ...existingFlag.details as any, finalActual: details.actual, note: "Automatically resolved" }
          }
        });
        logger.info(`Resolved ${flagType} flag for student ${studentId}`);
      }
      return;
    } catch {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data: existingFlag } = await supabase
        .from('early_warning_flags')
        .select('*')
        .eq('school_id', schoolId)
        .eq('student_id', studentId)
        .eq('flag_type', flagType)
        .eq('is_resolved', false)
        .maybeSingle();

      const nowIso = new Date().toISOString();

      if (shouldFlag) {
        if (!existingFlag) {
          await supabase.from('early_warning_flags').insert({
            id: generateCuid(),
            school_id: schoolId,
            student_id: studentId,
            flag_type: flagType,
            details,
            is_resolved: false,
            created_at: nowIso,
            updated_at: nowIso
          });
        } else {
          await supabase.from('early_warning_flags').update({
            details,
            updated_at: nowIso
          }).eq('id', existingFlag.id);
        }
      } else if (existingFlag) {
        await supabase.from('early_warning_flags').update({
          is_resolved: true,
          resolved_at: nowIso,
          updated_at: nowIso,
          details: { ...existingFlag.details, finalActual: details.actual, note: "Automatically resolved" }
        }).eq('id', existingFlag.id);
      }
    } catch (sbErr: any) {
      logger.error('Supabase manageFlag failed', { error: sbErr?.message });
    }
  }
}

export async function evaluateAllStudents(schoolId: string, classId?: string): Promise<number> {
  let studentIds: string[] = [];

  if (isPrismaAvailable()) {
    try {
      const students = await prisma.student.findMany({
        where: {
          schoolId,
          isActive: true,
          ...(classId && { classId })
        },
        select: { id: true }
      });
      studentIds = students.map(s => s.id);
    } catch {
      markPrismaFailure();
    }
  }

  if (studentIds.length === 0 && supabase) {
    try {
      let query = supabase
        .from('students')
        .select('id')
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (classId) query = query.eq('class_id', classId);

      const { data } = await query;
      studentIds = (data || []).map((s: any) => s.id);
    } catch (sbErr: any) {
      logger.error('Supabase evaluateAllStudents fetch failed', { error: sbErr?.message });
    }
  }

  let evaluatedCount = 0;
  for (const id of studentIds) {
    await evaluateStudent(id, schoolId);
    evaluatedCount++;
  }

  return evaluatedCount;
}
