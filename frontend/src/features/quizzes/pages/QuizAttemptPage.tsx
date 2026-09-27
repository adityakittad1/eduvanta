import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, useToast } from '@/components/ui';
import { quizzesApi, Quiz } from '../api/quizzes';
import { useAuth } from '@/store/AuthContext';

export function QuizAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  if (user?.role !== 'STUDENT') {
    navigate('/erp/quizzes');
    return null;
  }

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, 'A'|'B'|'C'|'D'>>({});
  
  const fetchQuiz = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await quizzesApi.getQuizById(id);
      setQuiz(data);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/erp/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const handleOptionSelect = (questionId: string, option: 'A'|'B'|'C'|'D') => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!id || !quiz) return;
    
    // Validate all answered
    const allAnswered = quiz.questions?.every(q => answers[q.id]);
    if (!allAnswered) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const answerArray = Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedOption: answers[qId]
      }));

      await quizzesApi.submitQuiz(id, answerArray);
      toast.success('Quiz submitted successfully!');
      fetchQuiz(); // Refresh to show results
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;
  if (!quiz) return <div style={{ padding: 'var(--space-6)' }}>Quiz not found.</div>;

  const isCompleted = !!quiz.studentAttempt;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/erp/quizzes')} style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> Back to Quizzes
        </Button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
          {quiz.title}
        </h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: 'var(--space-1)' }}>
          {quiz.subject.name} &bull; {quiz.class.name} {quiz.class.division || ''}
          {quiz.topic && ` • ${quiz.topic}`}
        </p>
      </div>

      {isCompleted ? (
        <div style={{ background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', textAlign: 'center' }}>
          <CheckCircle size={48} className="text-success-500" style={{ margin: '0 auto var(--space-4)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-success-900)', marginBottom: 'var(--space-2)' }}>
            Quiz Completed!
          </h2>
          <p style={{ color: 'var(--color-success-700)', fontSize: '1.125rem' }}>
            Your score: <strong style={{ fontSize: '1.5rem' }}>{quiz.studentAttempt?.score} / {quiz.studentAttempt?.maxScore}</strong>
          </p>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button onClick={() => navigate('/erp/quizzes')} variant="primary">Return to Dashboard</Button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-6)' }}>
            {!quiz.questions || quiz.questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-neutral-500)' }}>
                No questions available for this quiz.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                {quiz.questions.map((q, i) => (
                  <div key={q.id}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-4)' }}>
                      <span style={{ color: 'var(--color-neutral-400)', marginRight: 'var(--space-2)' }}>{i + 1}.</span>
                      {q.questionText}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const val = (q as any)[`option${opt}`];
                        if (!val) return null;
                        const isSelected = answers[q.id] === opt;
                        return (
                          <div 
                            key={opt}
                            onClick={() => handleOptionSelect(q.id, opt as 'A'|'B'|'C'|'D')}
                            style={{
                              padding: 'var(--space-3) var(--space-4)',
                              borderRadius: 'var(--radius-md)',
                              border: `1px solid ${isSelected ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
                              background: isSelected ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: 'var(--space-3)',
                              transition: 'all 0.2s',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ 
                              width: 20, height: 20, borderRadius: '50%', 
                              border: `2px solid ${isSelected ? 'var(--color-primary-600)' : 'var(--color-neutral-300)'}`,
                              background: isSelected ? 'var(--color-primary-600)' : 'transparent',
                              display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }}>
                              {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                            </div>
                            <span style={{ fontWeight: 'var(--font-medium)', color: isSelected ? 'var(--color-primary-900)' : 'var(--color-neutral-700)' }}>
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {quiz.questions && quiz.questions.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>
                {Object.keys(answers).length} of {quiz.questions.length} answered
              </div>
              <Button onClick={handleSubmit} variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
