/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 *
 * Question Bank Browser Component (Classes 1-10, 4,000 Questions)
 */

import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Check, Layers, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button, Badge, Input, Select, useToast } from '@/components/ui';
import { quizzesApi } from '../api/quizzes';

interface QuestionItem {
  id: string;
  classNum: number;
  subject: string;
  subjectCode: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: 'SINGLE_MCQ' | 'MULTIPLE_MCQ' | 'FILL_BLANKS' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  marks: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C?: string;
    D?: string;
  };
  correctOption: string;
  explanation: string;
}

export function QuestionBankBrowser({ onSelectQuestions }: { onSelectQuestions?: (ids: string[]) => void }) {
  const toast = useToast();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [classNum, setClassNum] = useState<number | ''>(5);
  const [subject, setSubject] = useState<string>('Mathematics');
  const [difficulty, setDifficulty] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await quizzesApi.getQuestionBank({
        classNum: classNum ? Number(classNum) : undefined,
        subject: subject || undefined,
        difficulty: difficulty || undefined,
        questionType: questionType || undefined,
        search: search.trim() || undefined,
        page,
        limit: 15,
      });
      setQuestions(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Failed to load question bank items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [classNum, subject, difficulty, questionType, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const toggleExplanation = (id: string) => {
    setExpandedExplanations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      if (onSelectQuestions) onSelectQuestions(next);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%' }}>
      {/* Filter Bar */}
      <div style={{ 
        background: 'var(--color-neutral-0)', 
        padding: 'var(--space-4)', 
        borderRadius: 'var(--radius-xl)', 
        border: '1px solid var(--color-neutral-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}>
        {/* Class Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>
            Class:
          </span>
          <button
            type="button"
            onClick={() => { setClassNum(''); setPage(1); }}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: classNum === '' ? 700 : 500,
              background: classNum === '' ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
              color: classNum === '' ? '#fff' : 'var(--color-neutral-700)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            All Classes
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => { setClassNum(c); setPage(1); }}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: classNum === c ? 700 : 500,
                background: classNum === c ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
                color: classNum === c ? '#fff' : 'var(--color-neutral-700)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Class {c}
            </button>
          ))}
        </div>

        {/* Dropdowns & Search */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Select 
            label="Subject" 
            value={subject} 
            onChange={(e) => { setSubject(e.target.value); setPage(1); }}
          >
            <option value="">All Curriculum Subjects</option>
            <option value="Mathematics">Mathematics (Classes 1–10)</option>
            <option value="Science">Science (Classes 5–10)</option>
            <option value="Environmental Studies">Environmental Studies (EVS, Classes 1–4)</option>
            <option value="English">English Grammar & Literature (Classes 1–10)</option>
            <option value="Social Science">Social Science (Classes 6–10)</option>
            <option value="Hindi">Hindi Vyakaran (Classes 1–5)</option>
          </Select>

          <Select 
            label="Difficulty" 
            value={difficulty} 
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy (40%)</option>
            <option value="MEDIUM">Medium (40%)</option>
            <option value="HARD">Hard (20%)</option>
          </Select>

          <Select 
            label="Question Type" 
            value={questionType} 
            onChange={(e) => { setQuestionType(e.target.value); setPage(1); }}
          >
            <option value="">All Question Types</option>
            <option value="SINGLE_MCQ">Single Choice MCQ</option>
            <option value="MULTIPLE_MCQ">Multiple Choice MCQ</option>
            <option value="FILL_BLANKS">Fill in the Blanks</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Conceptual</option>
          </Select>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 20 }}>
            <Input 
              placeholder="Search keyword, formula, topic..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              leftIcon={<Search size={14} />}
            />
            <Button type="submit" variant="secondary" style={{ padding: '0 12px' }}>
              Filter
            </Button>
          </form>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
          Showing <strong>{questions.length}</strong> of <strong>{total}</strong> questions
          {classNum && ` for Class ${classNum}`}
          {subject && ` (${subject})`}
        </div>
        {selectedIds.length > 0 && (
          <Badge variant="primary">
            {selectedIds.length} questions selected
          </Badge>
        )}
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-neutral-300)' }}>
          <BookOpen size={40} style={{ color: 'var(--color-neutral-400)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-neutral-700)', fontWeight: 600 }}>No matching questions found</p>
          <p style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)', marginTop: 4 }}>Try clearing search keywords or selecting a different class/subject filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {questions.map((q, idx) => {
            const isSelected = selectedIds.includes(q.id);
            const isExpanded = expandedExplanations[q.id];

            return (
              <div 
                key={q.id}
                style={{
                  background: 'var(--color-neutral-0)',
                  border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-neutral-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Top Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <Badge variant="neutral">Class {q.classNum} • {q.subject}</Badge>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
                      Topic: <strong>{q.topic}</strong>
                    </span>
                    <Badge variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'danger'}>
                      {q.difficulty}
                    </Badge>
                    <Badge variant="neutral">
                      {q.questionType.replace('_', ' ')}
                    </Badge>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                      {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                    </span>
                  </div>

                  {onSelectQuestions && (
                    <Button 
                      variant={isSelected ? 'primary' : 'outline'} 
                      size="sm"
                      onClick={() => toggleSelect(q.id)}
                    >
                      {isSelected ? <><Check size={14} /> Selected</> : '+ Add to Quiz'}
                    </Button>
                  )}
                </div>

                {/* Question Text */}
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-neutral-900)', lineHeight: 1.5 }}>
                  {q.questionText}
                </div>

                {/* Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-2)' }}>
                  {Object.entries(q.options).map(([key, val]) => {
                    if (!val) return null;
                    const isCorrect = q.correctOption.includes(key);

                    return (
                      <div 
                        key={key}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: isCorrect ? 'var(--color-success-50)' : 'var(--color-neutral-50)',
                          border: isCorrect ? '1px solid var(--color-success-300)' : '1px solid var(--color-neutral-200)',
                          fontSize: 'var(--text-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: isCorrect ? 'var(--color-success-800)' : 'var(--color-neutral-700)'
                        }}
                      >
                        <strong style={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          background: isCorrect ? 'var(--color-success-600)' : 'var(--color-neutral-300)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          flexShrink: 0
                        }}>
                          {key}
                        </strong>
                        <span style={{ flex: 1 }}>{val}</span>
                        {isCorrect && <Check size={14} style={{ color: 'var(--color-success-600)' }} />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Toggle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--color-neutral-100)', paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleExplanation(q.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-600)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      width: 'fit-content'
                    }}
                  >
                    <Sparkles size={13} />
                    {isExpanded ? 'Hide Step-by-Step Explanation' : 'View Correct Answer & Explanation'}
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      background: 'var(--color-neutral-50)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-neutral-700)',
                      lineHeight: 1.6
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: 2 }}>
                        Correct Answer: <span style={{ color: 'var(--color-success-700)' }}>{q.correctOption}</span>
                      </div>
                      <div>{q.explanation}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)' }}>
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
export default QuestionBankBrowser;
