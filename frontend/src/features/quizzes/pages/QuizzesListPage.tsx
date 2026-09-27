import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, CheckCircle } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, useToast } from '@/components/ui';
import { quizzesApi, Quiz } from '../api/quizzes';
import { classesApi, Class, ClassSubject } from '../../classes/api/classes';
import { useAuth } from '@/store/AuthContext';

export function QuizzesListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    fetchQuizzes();
    if (isTeacher) {
      classesApi.getClasses().then(res => setClasses(res)).catch(console.error);
    }
  }, [isTeacher]);

  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    classesApi.getClassById(selectedClassId).then(data => {
      setSubjects(data.subjects || []);
    }).catch(console.error);
  }, [selectedClassId]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await quizzesApi.getQuizzes();
      setQuizzes(data);
    } catch (error) {
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
        title: formData.get('title') as string,
        topic: formData.get('topic') as string || undefined,
      });
      toast.success('Quiz created successfully!');
      setIsModalOpen(false);
      navigate(`/erp/quizzes/${newQuiz.id}/build`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create quiz');
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            {isTeacher ? 'My Quizzes' : 'Available Quizzes'}
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
            {isTeacher ? 'Create and manage interactive multiple-choice quizzes.' : 'Test your knowledge and earn points.'}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Plus size={16} /> New Quiz
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {quizzes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)' }}>
            <p style={{ color: 'var(--color-neutral-500)' }}>No quizzes found.</p>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div 
              key={quiz.id} 
              style={{ 
                background: 'var(--color-neutral-0)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--color-neutral-200)', 
                padding: 'var(--space-4)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => {
                if (isTeacher) navigate(`/erp/quizzes/${quiz.id}/build`);
                else navigate(`/erp/quizzes/${quiz.id}/attempt`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <Badge variant={quiz.isPublished ? 'success' : 'neutral'}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-1)' }}>
                {quiz.title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginBottom: 'var(--space-4)' }}>
                {quiz.subject.name} &bull; {quiz.class.name} {quiz.class.division || ''}
                {quiz.topic && ` • ${quiz.topic}`}
              </p>
              
              <div style={{ display: 'flex', gap: 'var(--space-4)', borderTop: '1px solid var(--color-neutral-100)', paddingTop: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                  <BookOpen size={14} /> {quiz._count?.questions || 0} Questions
                </div>
                {isTeacher && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                    <CheckCircle size={14} /> {quiz._count?.attempts || 0} Attempts
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Quiz">
        <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Quiz Title" name="title" required placeholder="e.g. Newton's Laws Quiz" />
          <Input label="Topic (Optional)" name="topic" placeholder="e.g. Physics Chapter 3" />
          <Select label="Class" name="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
            <option value="">Select a class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>)}
          </Select>
          <Select label="Subject" name="subjectId" required disabled={!selectedClassId}>
            <option value="">Select a subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Quiz</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
