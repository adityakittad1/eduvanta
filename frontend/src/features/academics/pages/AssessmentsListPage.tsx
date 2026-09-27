import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Calendar, GraduationCap, ChevronRight } from 'lucide-react';
import { Button, Modal, Input, Select, Badge, useToast } from '@/components/ui';
import { academicsApi, Assessment } from '../api/academics';
import { classesApi, Class, ClassSubject } from '../../classes/api/classes';

export function AssessmentsListPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<ClassSubject[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assessData, classData] = await Promise.all([
        academicsApi.getAssessments(),
        classesApi.getClasses().catch(() => [])
      ]);
      setAssessments(assessData);
      setClasses(classData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update available subjects when class changes in modal
  useEffect(() => {
    if (!selectedClassId) {
      setAvailableSubjects([]);
      return;
    }
    const cls = classes.find(c => c.id === selectedClassId);
    if (cls) {
      classesApi.getClassById(selectedClassId).then(data => {
        setAvailableSubjects(data.subjects || []);
      });
    }
  }, [selectedClassId, classes]);

  const handleCreateAssessment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      classId: formData.get('classId') as string,
      subjectId: formData.get('subjectId') as string,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      maxMarks: Number(formData.get('maxMarks')),
      conductedDate: formData.get('conductedDate') as string || undefined,
      academicYear: '2026-2027' // Hardcoded for this phase per standard
    };

    try {
      const newAssessment = await academicsApi.createAssessment(data);
      toast.success('Assessment created');
      setIsModalOpen(false);
      navigate(`/erp/academics/assessments/${newAssessment.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create assessment');
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading assessments...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>Academic Assessments</h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>Manage exams, unit tests, and student marks</p>
        </div>
        {classes.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New Assessment
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {assessments.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
            <BookOpen size={32} style={{ margin: '0 auto var(--space-4)', color: 'var(--color-neutral-300)' }} />
            <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>No Assessments Found</h3>
            <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>Click 'New Assessment' to create one.</p>
          </div>
        ) : (
          assessments.map(assessment => (
            <div 
              key={assessment.id} 
              onClick={() => navigate(`/erp/academics/assessments/${assessment.id}`)}
              style={{
                background: 'var(--color-neutral-0)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-neutral-200)',
                padding: 'var(--space-5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontWeight: 'var(--font-bold)', fontSize: '1.1rem', color: 'var(--color-primary-900)' }}>{assessment.name}</h3>
                  <Badge variant="info">{assessment.type.replace('_', ' ')}</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)' }}>
                  <BookOpen size={14} /> 
                  <span style={{ fontWeight: 'var(--font-medium)' }}>{assessment.subject?.name}</span>
                  <span>&bull;</span>
                  <span>{assessment.class?.name} {assessment.class?.division}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-neutral-100)', fontSize: 'var(--text-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-neutral-500)' }}>
                    <Calendar size={14} /> {assessment.conductedDate ? new Date(assessment.conductedDate).toLocaleDateString() : 'TBD'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-success-600)' }}>
                    <GraduationCap size={14} /> {assessment._count?.academicRecords || 0} Graded
                  </div>
                </div>
                <ChevronRight size={16} className="text-neutral-400" />
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assessment">
        <form onSubmit={handleCreateAssessment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Assessment Name" name="name" placeholder="e.g. Unit Test 1" required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Select label="Class" name="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
              <option value="">Select Class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.division}</option>
              ))}
            </Select>
            <Select label="Subject" name="subjectId" required disabled={!selectedClassId}>
              <option value="">Select Subject...</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Select label="Type" name="type" required>
              <option value="UNIT_TEST">Unit Test</option>
              <option value="HALF_YEARLY">Half Yearly</option>
              <option value="ANNUAL">Annual</option>
              <option value="PRACTICAL">Practical</option>
              <option value="PROJECT">Project</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input label="Max Marks" name="maxMarks" type="number" min="1" max="1000" defaultValue="100" required />
          </div>

          <Input label="Conducted Date (Optional)" name="conductedDate" type="date" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Assessment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
