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
import path from 'path';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export async function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const templates = await prisma.tcTemplate.findMany({
          where: { schoolId },
          orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: templates });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data: rows, error: sbErr } = await supabase
        .from('tc_templates')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (sbErr) throw new AppError('Failed to fetch templates: ' + sbErr.message, 500, 'INTERNAL_ERROR');

      const mapped = (rows || []).map(r => ({
        id: r.id,
        schoolId: r.school_id,
        name: r.name,
        version: r.version,
        fileUrl: r.file_url,
        status: r.status,
        createdAt: r.created_at,
        activatedAt: r.activated_at
      }));

      res.json({ success: true, data: mapped });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function uploadTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { name, fileUrl } = req.body;
    if (!fileUrl || !fileUrl.endsWith('.docx')) {
      throw new AppError('A valid DOCX fileUrl is required', 400, 'BAD_REQUEST');
    }

    if (isPrismaAvailable()) {
      try {
        const count = await prisma.tcTemplate.count({ where: { schoolId } });
        const version = count + 1;

        const template = await prisma.tcTemplate.create({
          data: {
            schoolId,
            name: name || `Template v${version}`,
            version,
            fileUrl,
            status: 'ARCHIVED',
            createdBy: req.user!.id
          }
        });

        res.status(201).json({ success: true, data: template });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { count } = await supabase.from('tc_templates').select('id', { count: 'exact', head: true }).eq('school_id', schoolId);
      const version = (count || 0) + 1;
      const templateId = generateCuid();
      const nowIso = new Date().toISOString();

      const { data: newRow, error: insertErr } = await supabase.from('tc_templates').insert({
        id: templateId,
        school_id: schoolId,
        name: name || `Template v${version}`,
        version,
        file_url: fileUrl,
        status: 'ARCHIVED',
        created_by: req.user!.id,
        created_at: nowIso,
        updated_at: nowIso
      }).select().single();

      if (insertErr) throw new AppError('Failed to create template: ' + insertErr.message, 500, 'INTERNAL_ERROR');

      res.status(201).json({
        success: true,
        data: {
          id: newRow.id,
          schoolId: newRow.school_id,
          name: newRow.name,
          version: newRow.version,
          fileUrl: newRow.file_url,
          status: newRow.status,
          createdAt: newRow.created_at
        }
      });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function activateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const templateId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        await prisma.$transaction([
          prisma.tcTemplate.updateMany({
            where: { schoolId, status: 'ACTIVE' },
            data: { status: 'ARCHIVED' }
          }),
          prisma.tcTemplate.update({
            where: { id: templateId, schoolId },
            data: { status: 'ACTIVE', activatedAt: new Date() }
          })
        ]);

        res.json({ success: true, message: 'Template activated successfully' });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const nowIso = new Date().toISOString();
      await supabase.from('tc_templates').update({ status: 'ARCHIVED', updated_at: nowIso }).eq('school_id', schoolId).eq('status', 'ACTIVE');
      await supabase.from('tc_templates').update({ status: 'ACTIVE', activated_at: nowIso, updated_at: nowIso }).eq('id', templateId).eq('school_id', schoolId);
      res.json({ success: true, message: 'Template activated successfully' });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function archiveTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const templateId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        await prisma.tcTemplate.update({
          where: { id: templateId, schoolId },
          data: { status: 'ARCHIVED' }
        });
        res.json({ success: true, message: 'Template archived successfully' });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      await supabase.from('tc_templates').update({ status: 'ARCHIVED', updated_at: new Date().toISOString() }).eq('id', templateId).eq('school_id', schoolId);
      res.json({ success: true, message: 'Template archived successfully' });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function generateTc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const tcId = req.params.tcId as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    let tc: any = null;
    let school: any = null;
    let template: any = null;

    if (isPrismaAvailable()) {
      try {
        tc = await prisma.transferCertificate.findUnique({
          where: { id: tcId, schoolId },
          include: { student: { include: { class: true } } }
        });
        if (tc) {
          school = await prisma.school.findUnique({ where: { id: schoolId } });
          template = await prisma.tcTemplate.findFirst({ where: { schoolId, status: 'ACTIVE' } });
        }
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    // Supabase fallback for reading TC, student, class, and school
    if (!tc && supabase) {
      const { data: tcRow } = await supabase.from('transfer_certificates').select('*').eq('id', tcId).eq('school_id', schoolId).maybeSingle();
      if (tcRow) {
        const { data: studentRow } = await supabase.from('students').select('*').eq('id', tcRow.student_id).maybeSingle();
        let classRow: any = null;
        if (studentRow?.class_id) {
          const { data: c } = await supabase.from('classes').select('name, division').eq('id', studentRow.class_id).maybeSingle();
          classRow = c;
        }
        tc = {
          ...tcRow,
          student: studentRow ? {
            ...studentRow,
            firstName: studentRow.first_name,
            lastName: studentRow.last_name,
            admissionNumber: studentRow.admission_number,
            guardianName: studentRow.guardian_name,
            dateOfBirth: studentRow.date_of_birth ? new Date(studentRow.date_of_birth) : null,
            enrollmentDate: studentRow.enrollment_date ? new Date(studentRow.enrollment_date) : null,
            class: classRow
          } : null
        };

        const { data: sRow } = await supabase.from('schools').select('*').eq('id', schoolId).maybeSingle();
        school = sRow ? {
          name: sRow.name,
          address: sRow.address,
          principalName: sRow.principal_name
        } : null;

        const { data: tmplRow } = await supabase.from('tc_templates').select('*').eq('school_id', schoolId).eq('status', 'ACTIVE').maybeSingle();
        if (tmplRow) {
          template = {
            id: tmplRow.id,
            version: tmplRow.version,
            fileUrl: tmplRow.file_url
          };
        }
      }
    }

    if (!tc) throw new AppError('TC Request not found', 404, 'NOT_FOUND');
    if (tc.status !== 'APPROVED') throw new AppError('TC Request must be approved first', 400, 'BAD_REQUEST');
    if (!school) throw new AppError('School not found', 404, 'NOT_FOUND');

    let content: Buffer | null = null;
    if (template && template.fileUrl) {
      if (template.fileUrl.startsWith('http')) {
        const response = await fetch(template.fileUrl);
        if (response.ok) {
          content = Buffer.from(await response.arrayBuffer());
        }
      } else {
        const filePath = path.join(__dirname, '../../..', template.fileUrl);
        if (fs.existsSync(filePath)) {
          content = fs.readFileSync(filePath);
        }
      }
    }

    if (!content) {
      const defaultPath = path.join(__dirname, '../../../public', 'default-tc-template.docx');
      if (fs.existsSync(defaultPath)) {
        content = fs.readFileSync(defaultPath);
      }
    }

    let generatedFileUrl = '';
    const nowIso = new Date().toISOString();

    if (content) {
      try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const data = {
          student_name: `${tc.student?.firstName || ''} ${tc.student?.lastName || ''}`.trim() || 'Student',
          father_name: tc.student?.guardianName || '',
          mother_name: '',
          date_of_birth: tc.student?.dateOfBirth ? (tc.student.dateOfBirth instanceof Date ? tc.student.dateOfBirth.toLocaleDateString('en-IN') : String(tc.student.dateOfBirth)) : '',
          admission_number: tc.student?.admissionNumber || tc.tc_number || 'N/A',
          date_of_admission: tc.student?.enrollmentDate ? (tc.student.enrollmentDate instanceof Date ? tc.student.enrollmentDate.toLocaleDateString('en-IN') : String(tc.student.enrollmentDate)) : '',
          date_of_leaving: new Date().toLocaleDateString('en-IN'),
          class: tc.student?.class?.name || '',
          section: tc.student?.class?.division || '',
          reason_for_leaving: tc.reason || 'Completed Course',
          conduct: 'Good',
          remarks: 'Issued on student/guardian application',
          school_name: school.name,
          school_address: school.address || '',
          principal_name: school.principalName || 'Principal'
        };

        doc.render(data);
        const buf = doc.getZip().generate({ type: 'nodebuffer' });

        const generatedFilename = `TC_${tc.student?.admissionNumber || tc.id}_${Date.now()}.docx`;

        // Try Supabase Storage upload
        if (supabase) {
          try {
            const filePath = `${schoolId}/${generatedFilename}`;
            const { error: upErr } = await supabase.storage.from('eduvanta-assets').upload(filePath, buf, {
              contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              upsert: true
            });
            if (!upErr) {
              const { data: publicUrlData } = supabase.storage.from('eduvanta-assets').getPublicUrl(filePath);
              generatedFileUrl = publicUrlData.publicUrl;
            }
          } catch {
            // Ignore storage failure; will fallback to base64 data URL
          }
        }

        // Resilient fallback to base64 data URL if storage upload was unavailable
        if (!generatedFileUrl) {
          generatedFileUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buf.toString('base64')}`;
        }
      } catch (docErr: any) {
        generatedFileUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(`OFFICIAL TRANSFER CERTIFICATE\nSchool: ${school.name}\nTC Number: ${tc.tc_number || tc.tcNumber}\nStudent: ${tc.student?.firstName} ${tc.student?.lastName}\nDate: ${new Date().toLocaleDateString('en-IN')}`)}`;
      }
    } else {
      generatedFileUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(`OFFICIAL TRANSFER CERTIFICATE\nSchool: ${school.name}\nTC Number: ${tc.tc_number || tc.tcNumber}\nStudent: ${tc.student?.firstName} ${tc.student?.lastName}\nDate: ${new Date().toLocaleDateString('en-IN')}`)}`;
    }

    // Update database record
    if (isPrismaAvailable()) {
      try {
        const updatedTc = await prisma.transferCertificate.update({
          where: { id: tc.id },
          data: {
            templateId: template?.id || null,
            templateVersion: template?.version || 1,
            fileUrl: generatedFileUrl,
            status: 'ISSUED',
            issuedDate: new Date()
          }
        });

        if (tc.studentId || tc.student_id) {
          await prisma.student.update({
            where: { id: tc.studentId || tc.student_id },
            data: { isActive: false }
          });
        }

        res.json({ success: true, data: updatedTc });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data: updatedTc, error: upErr } = await supabase
        .from('transfer_certificates')
        .update({
          template_id: template?.id || null,
          template_version: template?.version || 1,
          file_url: generatedFileUrl,
          status: 'ISSUED',
          issued_date: nowIso,
          updated_at: nowIso
        })
        .eq('id', tc.id)
        .select()
        .single();

      if (upErr) throw new AppError('Failed to record issued TC: ' + upErr.message, 500, 'INTERNAL_ERROR');

      if (tc.studentId || tc.student_id) {
        await supabase.from('students').update({ is_active: false }).eq('id', tc.studentId || tc.student_id);
      }

      res.json({
        success: true,
        data: {
          id: updatedTc.id,
          schoolId: updatedTc.school_id,
          studentId: updatedTc.student_id,
          tcNumber: updatedTc.tc_number,
          status: updatedTc.status,
          fileUrl: updatedTc.file_url,
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
