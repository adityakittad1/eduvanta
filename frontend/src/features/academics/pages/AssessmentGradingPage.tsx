import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, GraduationCap } from 'lucide-react';
import { Button, useToast } from '@/components/ui';
import { academicsApi, Assessment } from '../api/academics';
import { classesApi } from '../../classes/api/classes';
import { Student } from '../../students/api/students';

export function AssessmentGradingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  // State maps studentId -> marks and remarks
  const [marksState, setMarksState] = useState<Record<string, string>>({});
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!id) return;

        // Fetch assessment details
        const assessData = await academicsApi.getAssessmentById(id);
        setAssessment(assessData);

        // Fetch students in that class and existing marks in parallel
        const [classData, existingMarks] = await Promise.all([
          classesApi.getClassById(assessData.classId),
          academicsApi.getMarksForAssessment(id)
        ]);

        const enrolled = classData.students || [];
        setStudents(enrolled);

        // Populate existing state
        const initialMarks: Record<string, string> = {};
        const initialRemarks: Record<string, string> = {};
        
        existingMarks.forEach(record => {
          initialMarks[record.studentId] = record.marksObtained.toString();
          if (record.remarks) {
            initialRemarks[record.studentId] = record.remarks;
          }
        });

        setMarksState(initialMarks);
        setRemarksState(initialRemarks);

      } catch (error) {
        toast.error('Failed to load assessment data');
        navigate('/erp/academics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSaveAll = async () => {
    if (!id || !assessment) return;

    // Validate inputs
    const recordsToSave = [];
    for (const student of students) {
      const markStr = marksState[student.id];
      // Only save if a mark was actually entered
      if (markStr !== undefined && markStr.trim() !== '') {
        const mark = Number(markStr);
        if (isNaN(mark) || mark < 0 || mark > assessment.maxMarks) {
          toast.error(`Invalid mark for ${student.firstName}. Must be between 0 and ${assessment.maxMarks}`);
          return;
        }
        recordsToSave.push({
          studentId: student.id,
          marksObtained: mark,
          remarks: remarksState[student.id]
        });
      }
    }

    if (recordsToSave.length === 0) {
      toast.error('No marks entered to save');
      return;
    }

    try {
      setIsSaving(true);
      await academicsApi.saveMarks(id, recordsToSave);
      toast.success(`Successfully saved marks for ${recordsToSave.length} students`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksState(prev => ({ ...prev, [studentId]: value }));
  };

  const handleRemarkChange = (studentId: string, value: string) => {
    setRemarksState(prev => ({ ...prev, [studentId]: value }));
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading grading interface...</div>;
  if (!assessment) return null;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/erp/academics')} style={{ marginBottom: 'var(--space-4)' }}>
          <ChevronLeft size={16} /> Back to Assessments
        </Button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>{assessment.name}</h1>
            <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-lg)', marginTop: 'var(--space-1)' }}>
              {assessment.subject?.name} &bull; {assessment.class?.name} {assessment.class?.division}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', fontWeight: 'var(--font-medium)' }}>MAX MARKS</div>
            <div style={{ fontSize: '2rem', fontWeight: 'var(--font-bold)', color: 'var(--color-primary-600)', lineHeight: 1 }}>{assessment.maxMarks}</div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <GraduationCap size={20} className="text-primary-600" />
          <h2 style={{ fontSize: '1rem', fontWeight: 'var(--font-semibold)' }}>Student Roster ({students.length})</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-neutral-200)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-neutral-500)', fontWeight: 'var(--font-medium)' }}>Roll No</th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-neutral-500)', fontWeight: 'var(--font-medium)' }}>Student Name</th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-neutral-500)', fontWeight: 'var(--font-medium)', width: '200px' }}>Marks Obtained</th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-neutral-500)', fontWeight: 'var(--font-medium)' }}>Remarks (Optional)</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                    No students enrolled in this class.
                  </td>
                </tr>
              ) : (
                students.map(student => {
                  const currentMark = marksState[student.id] || '';
                  const isExceeding = currentMark !== '' && Number(currentMark) > assessment.maxMarks;
                  
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--color-neutral-100)', transition: 'background 0.2s', ':hover': { background: 'var(--color-neutral-50)' } } as any}>
                      <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-neutral-600)' }}>{student.admissionNumber}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-6)', fontWeight: 'var(--font-medium)' }}>{student.firstName} {student.lastName}</td>
                      <td style={{ padding: 'var(--space-2) var(--space-6)' }}>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="number" 
                            min="0"
                            max={assessment.maxMarks}
                            value={currentMark}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            style={{ 
                              width: '100%', 
                              padding: 'var(--space-2) var(--space-3)', 
                              borderRadius: 'var(--radius-md)', 
                              border: `1px solid ${isExceeding ? 'var(--color-danger-500)' : 'var(--color-neutral-300)'}`,
                              background: isExceeding ? 'var(--color-danger-50)' : 'var(--color-neutral-0)',
                              fontSize: '1rem',
                              fontWeight: 'var(--font-medium)',
                              outline: 'none'
                            }}
                            placeholder="-"
                          />
                          {isExceeding && <span style={{ color: 'var(--color-danger-600)', fontSize: '10px', position: 'absolute', bottom: '-16px', left: 0 }}>Max is {assessment.maxMarks}</span>}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-6)' }}>
                        <input 
                          type="text" 
                          value={remarksState[student.id] || ''}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: 'var(--space-2) var(--space-3)', 
                            borderRadius: 'var(--radius-md)', 
                            border: '1px solid var(--color-neutral-300)',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                          placeholder="e.g. Needs improvement"
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-neutral-0)' }}>
          <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>Changes are only saved when you click Save All.</span>
          <Button onClick={handleSaveAll} disabled={isSaving || students.length === 0}>
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save All Marks'}
          </Button>
        </div>
      </div>
    </div>
  );
}
