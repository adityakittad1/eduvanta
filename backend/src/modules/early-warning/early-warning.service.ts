import { prisma } from '../../lib/prisma';
import { WarningType } from '@prisma/client';
import { logger } from '../../lib/logger';

const ATTENDANCE_THRESHOLD = 75; // below 75% triggers a warning
const ACADEMICS_THRESHOLD = 40;  // below 40% average triggers a warning

export async function evaluateStudent(studentId: string, schoolId: string): Promise<void> {
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

  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : null;

  await manageFlag(
    schoolId,
    studentId,
    'LOW_ATTENDANCE',
    attendancePercentage !== null && attendancePercentage < ATTENDANCE_THRESHOLD,
    { threshold: ATTENDANCE_THRESHOLD, actual: attendancePercentage ? Math.round(attendancePercentage) : 0 }
  );

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

  const academicPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : null;

  await manageFlag(
    schoolId,
    studentId,
    'LOW_ACADEMIC_PERFORMANCE',
    academicPercentage !== null && academicPercentage < ACADEMICS_THRESHOLD,
    { threshold: ACADEMICS_THRESHOLD, actual: academicPercentage ? Math.round(academicPercentage) : 0 }
  );
}

async function manageFlag(schoolId: string, studentId: string, flagType: WarningType, shouldFlag: boolean, details: any) {
  // Find existing active flag
  const existingFlag = await prisma.earlyWarningFlag.findFirst({
    where: { schoolId, studentId, flagType, isResolved: false }
  });

  if (shouldFlag) {
    if (!existingFlag) {
      // Create new flag
      await prisma.earlyWarningFlag.create({
        data: {
          schoolId,
          studentId,
          flagType,
          details
        }
      });
      logger.info(`Generated ${flagType} flag for student ${studentId}`);
    } else {
      // Update details if necessary (optional, but good for keeping the actual % up to date)
      await prisma.earlyWarningFlag.update({
        where: { id: existingFlag.id },
        data: { details }
      });
    }
  } else {
    // If flag is active but condition is no longer met, resolve it
    if (existingFlag) {
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
  }
}

export async function evaluateAllStudents(schoolId: string, classId?: string): Promise<number> {
  const students = await prisma.student.findMany({
    where: {
      schoolId,
      isActive: true,
      ...(classId && { classId })
    },
    select: { id: true }
  });

  let evaluatedCount = 0;
  for (const student of students) {
    await evaluateStudent(student.id, schoolId);
    evaluatedCount++;
  }

  return evaluatedCount;
}
