const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx');

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "{{school_name}}",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: "{{school_address}}",
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: "TRANSFER CERTIFICATE",
                    heading: HeadingLevel.HEADING_2,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "1. Name of Pupil: ", bold: true }),
                        new TextRun("{{student_name}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "2. Father's / Guardian's Name: ", bold: true }),
                        new TextRun("{{father_name}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "3. Mother's Name: ", bold: true }),
                        new TextRun("{{mother_name}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "4. Admission Number: ", bold: true }),
                        new TextRun("{{admission_number}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "5. Date of Birth: ", bold: true }),
                        new TextRun("{{date_of_birth}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "6. Date of Admission: ", bold: true }),
                        new TextRun("{{date_of_admission}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "7. Class in which the pupil last studied: ", bold: true }),
                        new TextRun("{{class}} - {{section}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "8. Date of leaving the school: ", bold: true }),
                        new TextRun("{{date_of_leaving}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "9. Reason for leaving the school: ", bold: true }),
                        new TextRun("{{reason_for_leaving}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "10. Conduct: ", bold: true }),
                        new TextRun("{{conduct}}"),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "11. Any other remarks: ", bold: true }),
                        new TextRun("{{remarks}}"),
                    ],
                    spacing: { after: 1000 },
                }),
                new Paragraph({
                    children: [
                        new TextRun("Date of Issue: {{date_of_leaving}}"),
                    ],
                    alignment: AlignmentType.LEFT,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Signature of Principal", bold: true }),
                    ],
                    alignment: AlignmentType.RIGHT,
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('public/default-tc-template.docx', buffer);
    console.log('Template generated successfully');
});
