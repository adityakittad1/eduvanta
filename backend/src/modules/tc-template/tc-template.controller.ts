import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import path from 'path';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export async function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const templates = await prisma.tcTemplate.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: templates });
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

    // Determine next version
    const count = await prisma.tcTemplate.count({ where: { schoolId } });
    const version = count + 1;

    // Archive all other templates when uploading a new one? No, user manually activates.
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
  } catch (error) {
    next(error);
  }
}

export async function activateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const templateId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

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
  } catch (error) {
    next(error);
  }
}

export async function archiveTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const templateId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    await prisma.tcTemplate.update({
      where: { id: templateId, schoolId },
      data: { status: 'ARCHIVED' }
    });

    res.json({ success: true, message: 'Template archived successfully' });
  } catch (error) {
    next(error);
  }
}

export async function generateTc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const tcId = req.params.tcId as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    // 1. Get the requested TC and student info
    const tc: any = await prisma.transferCertificate.findUnique({
      where: { id: tcId, schoolId },
      include: {
        student: {
          include: { class: true }
        }
      }
    });
    if (!tc) throw new AppError('TC Request not found', 404, 'NOT_FOUND');
    if (tc.status !== 'APPROVED') throw new AppError('TC Request must be approved first', 400, 'BAD_REQUEST');

    // 2. Get school info
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new AppError('School not found', 404, 'NOT_FOUND');

    // 3. Get active template
    const template = await prisma.tcTemplate.findFirst({
      where: { schoolId, status: 'ACTIVE' }
    });
    if (!template) throw new AppError('No active TC template found for this school', 400, 'BAD_REQUEST');

    // 4. Load the DOCX file
    // fileUrl is like "/uploads/123.docx"
    const filePath = path.join(__dirname, '../../..', template.fileUrl);
    if (!fs.existsSync(filePath)) {
      throw new AppError('Template file is missing from server', 500, 'INTERNAL_SERVER_ERROR');
    }

    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

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
    const generatedPath = path.join(__dirname, '../../../uploads', generatedFilename);
    fs.writeFileSync(generatedPath, buf);

    const generatedFileUrl = `/uploads/${generatedFilename}`;

    // 7. Update the TC record
    const updatedTc = await prisma.transferCertificate.update({
      where: { id: tc.id },
      data: {
        templateId: template.id,
        templateVersion: template.version,
        fileUrl: generatedFileUrl,
        status: 'ISSUED',
        issuedDate: new Date()
      }
    });

    // 8. Mark student inactive
    await prisma.student.update({
      where: { id: tc.studentId },
      data: { isActive: false }
    });

    res.json({ success: true, data: updatedTc });
  } catch (error) {
    next(error);
  }
}
