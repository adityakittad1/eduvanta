import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, ArrowLeft, BookOpen } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, useToast } from '@/components/ui';
import { quizzesApi, Quiz, QuizQuestion } from '../api/quizzes';
import { useAuth } from '@/store/AuthContext';

export function QuizBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  if (user?.role !== 'TEACHER' && user?.role !== 'PRINCIPAL') {
    navigate('/erp/quizzes');
    return null;
  }

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchQuiz = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await quizzesApi.getQuizById(id);
      setQuiz(data);
    } catch (error) {
      toast.error('Failed to load quiz details');
      navigate('/erp/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const handleAddQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !quiz) return;
    const formData = new FormData(e.currentTarget);
    try {
      await quizzesApi.addQuestion(id, {
        questionText: formData.get('questionText') as string,
        optionA: formData.get('optionA') as string,
        optionB: formData.get('optionB') as string,
        optionC: formData.get('optionC') as string || null,
        optionD: formData.get('optionD') as string || null,
        correctOption: formData.get('correctOption') as 'A'|'B'|'C'|'D',
        order: (quiz.questions?.length || 0) + 1
      });
      toast.success('Question added!');
      setIsModalOpen(false);
      fetchQuiz();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add question');
    }
  };

  const handlePublish = async () => {
    if (!id || !quiz) return;
    if ((quiz.questions?.length || 0) === 0) {
      toast.error('Cannot publish an empty quiz.');
      return;
    }
    try {
      setIsPublishing(true);
      await quizzesApi.publishQuiz(id);
      toast.success('Quiz published successfully! Students can now attempt it.');
      fetchQuiz();
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish quiz');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;
  if (!quiz) return <div style={{ padding: 'var(--space-6)' }}>Quiz not found.</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/erp/quizzes')} style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> Back to Quizzes
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
                {quiz.title}
              </h1>
              <Badge variant={quiz.isPublished ? 'success' : 'neutral'}>
                {quiz.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p style={{ color: 'var(--color-neutral-600)' }}>
              {quiz.subject.name} &bull; {quiz.class.name} {quiz.class.division || ''}
              {quiz.topic && ` • ${quiz.topic}`}
            </p>
          </div>
          {!quiz.isPublished && (
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button onClick={() => setIsModalOpen(true)} variant="secondary">
                <Plus size={16} /> Add Question
              </Button>
              <Button onClick={handlePublish} variant="primary" disabled={isPublishing}>
                <Check size={16} /> {isPublishing ? 'Publishing...' : 'Publish Quiz'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row if published */}
      {quiz.isPublished && (
        <div style={{ background: 'var(--color-primary-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-100)', display: 'flex', gap: 'var(--space-6)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)' }}>Total Questions</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'var(--font-bold)', color: 'var(--color-primary-900)' }}>{quiz.questions?.length || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)' }}>Student Attempts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'var(--font-bold)', color: 'var(--color-primary-900)' }}>{quiz.attempts?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-800)', marginBottom: 'var(--space-4)' }}>
          Questions
        </h2>
        {quiz.questions?.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)' }}>
            <BookOpen size={32} style={{ margin: '0 auto var(--space-4)', color: 'var(--color-neutral-400)' }} />
            <p style={{ color: 'var(--color-neutral-600)', marginBottom: 'var(--space-4)' }}>No questions added yet.</p>
            {!quiz.isPublished && (
              <Button onClick={() => setIsModalOpen(true)} variant="primary">Add First Question</Button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {quiz.questions?.map((q, i) => (
              <div key={q.id} style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-400)' }}>Q{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-3)' }}>{q.questionText}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const val = q[`option${opt}` as keyof QuizQuestion];
                        if (!val) return null;
                        const isCorrect = q.correctOption === opt;
                        return (
                          <div key={opt} style={{ 
                            padding: 'var(--space-2) var(--space-3)', 
                            borderRadius: 'var(--radius-sm)', 
                            border: `1px solid ${isCorrect ? 'var(--color-success-300)' : 'var(--color-neutral-200)'}`,
                            background: isCorrect ? 'var(--color-success-50)' : 'var(--color-neutral-0)',
                            display: 'flex', gap: 'var(--space-2)'
                          }}>
                            <span style={{ fontWeight: 'var(--font-semibold)', color: isCorrect ? 'var(--color-success-700)' : 'var(--color-neutral-500)' }}>{opt}.</span>
                            <span style={{ color: isCorrect ? 'var(--color-success-900)' : 'var(--color-neutral-700)' }}>{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attempts List (If published) */}
      {quiz.isPublished && quiz.attempts && quiz.attempts.length > 0 && (
        <div style={{ marginTop: 'var(--space-8)' }}>
           <h2 style={{ fontSize: '1.25rem', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-800)', marginBottom: 'var(--space-4)' }}>
            Student Attempts
          </h2>
          <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)' }}>Student</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)' }}>Score</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {quiz.attempts.map(attempt => (
                  <tr key={attempt.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{attempt.student?.firstName} {attempt.student?.lastName}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>{attempt.student?.admissionNumber}</div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 'var(--font-bold)', color: (attempt.score / attempt.maxScore) < 0.4 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}>
                        {attempt.score} / {attempt.maxScore}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                        {((attempt.score / attempt.maxScore) * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-neutral-600)' }}>
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Question">
        <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-1)' }}>
              Question Text
            </label>
            <textarea 
              name="questionText" 
              required 
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', minHeight: 80 }}
            ></textarea>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Option A" name="optionA" required />
            <Input label="Option B" name="optionB" required />
            <Input label="Option C (Optional)" name="optionC" />
            <Input label="Option D (Optional)" name="optionD" />
          </div>

          <Select label="Correct Option" name="correctOption" required>
            <option value="A">Option A</option>
            <option value="B">Option B</option>
            <option value="C">Option C</option>
            <option value="D">Option D</option>
          </Select>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Question</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
