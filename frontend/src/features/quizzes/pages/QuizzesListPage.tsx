import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, EmptyState, useToast } from '@/components/ui';
import { quizzesApi, Quiz } from '../api/quizzes';
import { classesApi, Class, ClassSubject } from '../../classes/api/classes';
import { useAuth } from '@/store/AuthContext';

export function QuizzesListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const canManage = user?.role === 'TEACHER' || user?.role === 'PRINCIPAL';
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    fetchQuizzes();
    if (canManage) {
      classesApi.getClasses().then(res => setClasses(res)).catch(() => {});
    }
  }, [canManage]);

  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    classesApi.getClassById(selectedClassId).then(data => {
      setSubjects(data.subjects || []);
    }).catch(() => {});
  }, [selectedClassId]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await quizzesApi.getQuizzes();
      setQuizzes(data);
    } catch {
      toast.error('Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const newQuiz = await quizzesApi.createQuiz({
        classId: formData.get('classId') as string,
        subjectId: formData.get('subjectId') as string,
        title: (formData.get('title') as string)?.trim(),
        topic: (formData.get('topic') as string)?.trim() || undefined,
      });
      toast.success('Quiz created successfully');
      setIsModalOpen(false);
      navigate(`/erp/quizzes/${newQuiz.id}/build`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create quiz');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            {canManage ? 'Interactive Assessments & Quizzes' : 'Available Knowledge Quizzes'}
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            {canManage ? 'Author, publish, and review automated multiple-choice tests' : 'Test subject comprehension, earn badges, and review scores'} ({quizzes.length} tests)
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Plus size={16} /> Create Quiz
          </Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 150, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={<HelpCircle size={48} />}
          title="No quizzes available"
          description="Interactive classroom assessments and online quizzes created by teachers will appear here."
          action={canManage ? { label: "Create First Quiz", onClick: () => setIsModalOpen(true) } : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {quizzes.map(quiz => (
            <div 
              key={quiz.id} 
              style={{ 
                background: 'var(--color-neutral-0)', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--color-neutral-200)', 
                padding: 'var(--space-5)',
                cursor: 'pointer',
                transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                boxShadow: 'var(--shadow-xs)',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => {
                if (canManage) navigate(`/erp/quizzes/${quiz.id}/build`);
                else navigate(`/erp/quizzes/${quiz.id}/attempt`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <Badge variant={quiz.isPublished ? 'success' : 'neutral'}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                  {new Date(quiz.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {quiz.title}
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginBottom: 'var(--space-4)', flex: 1 }}>
                {quiz.subject?.name || 'General'} &bull; {quiz.class?.name || 'Class'} {quiz.class?.division || ''}
                {quiz.topic && ` • ${quiz.topic}`}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-neutral-100)', paddingTop: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', fontWeight: 500 }}>
                  <BookOpen size={13} style={{ color: 'var(--color-primary-600)' }} /> {quiz._count?.questions || 0} Questions
                </div>
                {canManage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', fontWeight: 500 }}>
                    <CheckCircle size={13} style={{ color: 'var(--color-success-600)' }} /> {quiz._count?.attempts || 0} Attempts
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Interactive Quiz">
        <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Quiz Title" name="title" required placeholder="e.g. Science Chapter 3 Multiple-Choice Evaluation" />
          <Input label="Topic / Chapter (Optional)" name="topic" placeholder="e.g. Chemical Reactions and Equations" />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Select label="Target Class" name="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
              <option value="">Select a class division...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>)}
            </Select>
            <Select label="Subject" name="subjectId" required disabled={!selectedClassId}>
              <option value="">Select subject curriculum...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Proceed to Question Builder</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default QuizzesListPage;
