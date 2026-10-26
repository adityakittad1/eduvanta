import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Users, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import { Button, Modal, Input, Select, useToast, DataTable } from '@/components/ui';
import { classesApi, Class } from '../api/classes';
import { teachersApi, Teacher } from '../../teachers/api/teachers';
import { studentsApi, Student } from '../../students/api/students';

export function ClassDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [classData, setClassData] = useState<Class | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subjects' | 'students'>('subjects');
  
  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [assignTeacherModal, setAssignTeacherModal] = useState<{ isOpen: boolean; subjectId?: string }>({ isOpen: false });
  const [isAssignStudentModalOpen, setIsAssignStudentModalOpen] = useState(false);
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const fetchAllData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const cls = await classesApi.getClassById(id);
      setClassData(cls);
      
      const tRes = await teachersApi.getTeachers(1, 100);
      setTeachers(tRes.data);
      
      const sRes = await studentsApi.getStudents(1, 1000, 'null');
      setUnassignedStudents(sRes.data);
    } catch (error) {
      toast.error('Failed to load class details');
      navigate('/erp/classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    const formData = new FormData(e.currentTarget);
    const defaultSubjects = formData.getAll('defaultSubjects') as string[];
    const customName = formData.get('customName') as string;
    const customCode = formData.get('customCode') as string || undefined;

    const subjectsToCreate: { name: string, code?: string }[] = [];

    defaultSubjects.forEach(sub => {
      subjectsToCreate.push({ name: sub, code: sub.substring(0, 4).toUpperCase() });
    });

    if (customName && customName.trim() !== '') {
      subjectsToCreate.push({ name: customName, code: customCode });
    }

    if (subjectsToCreate.length === 0) {
      toast.error('Please select at least one subject or enter a custom one');
      return;
    }

    try {
      await Promise.all(subjectsToCreate.map(data => classesApi.createSubject(id, data)));
      toast.success(`${subjectsToCreate.length} Subject(s) created`);
      setIsSubjectModalOpen(false);
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create some subjects (may already exist)');
      fetchAllData();
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !assignTeacherModal.subjectId || !classData) return;
    const formData = new FormData(e.currentTarget);
    try {
      await classesApi.assignTeacher(id, {
        subjectId: assignTeacherModal.subjectId,
        teacherId: formData.get('teacherId') as string,
        academicYear: classData.academicYear,
      });
      toast.success('Teacher assigned to subject');
      setAssignTeacherModal({ isOpen: false });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAssignStudents = async () => {
    if (!id || selectedStudentIds.length === 0) return;
    try {
      await classesApi.assignStudents(id, selectedStudentIds);
      toast.success(`Assigned ${selectedStudentIds.length} students`);
      setIsAssignStudentModalOpen(false);
      setSelectedStudentIds([]);
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading class details...</div>;
  if (!classData) return <div style={{ padding: 'var(--space-6)' }}>Class not found.</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/erp/classes')} style={{ marginBottom: 'var(--space-4)' }}>
          <ChevronLeft size={16} /> Back to Classes
        </Button>
        <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
                {classData.name} {classData.division}
              </h1>
              <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-md)' }}>
                Academic Year: {classData.academicYear} &bull; {classData.students?.length || 0} Students &bull; {classData.subjects?.length || 0} Subjects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-neutral-200)', gap: 'var(--space-6)' }}>
        <button 
          onClick={() => setActiveTab('subjects')}
          style={{ 
            padding: 'var(--space-3) 0', 
            background: 'none', border: 'none', 
            fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', cursor: 'pointer',
            color: activeTab === 'subjects' ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            borderBottom: activeTab === 'subjects' ? '2px solid var(--color-primary-600)' : '2px solid transparent'
          }}>
          <BookOpen size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Subjects & Teachers
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          style={{ 
            padding: 'var(--space-3) 0', 
            background: 'none', border: 'none', 
            fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', cursor: 'pointer',
            color: activeTab === 'students' ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            borderBottom: activeTab === 'students' ? '2px solid var(--color-primary-600)' : '2px solid transparent'
          }}>
          <Users size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Enrolled Students
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        
        {/* SUBJECTS TAB */}
        {activeTab === 'subjects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>Subjects</h2>
              <Button size="sm" onClick={() => setIsSubjectModalOpen(true)}><Plus size={16} /> Add Subject</Button>
            </div>
            
            {classData.subjects?.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-neutral-500)' }}>No subjects added yet.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {classData.subjects?.map(subject => {
                  // Find the teacher assigned for the current academic year
                  const assignment = subject.teacherClassSubjects?.find(t => t.academicYear === classData.academicYear);
                  
                  return (
                    <li key={subject.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{subject.name} {subject.code && <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)' }}>({subject.code})</span>}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                          Teacher: {assignment ? <span style={{ color: 'var(--color-neutral-900)' }}>{assignment.teacher.firstName} {assignment.teacher.lastName}</span> : <span style={{ color: 'var(--color-danger-600)' }}>Unassigned</span>}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => setAssignTeacherModal({ isOpen: true, subjectId: subject.id })}>
                        {assignment ? 'Change Teacher' : 'Assign Teacher'}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>Enrolled Students</h2>
              <Button size="sm" onClick={() => setIsAssignStudentModalOpen(true)}><Plus size={16} /> Bulk Assign Students</Button>
            </div>
            
            <DataTable 
              columns={[
                { header: 'Admn No.', cell: (s: Student) => s.admissionNumber },
                { header: 'Name', cell: (s: Student) => `${s.firstName} ${s.lastName}` },
                { header: 'Gender', cell: (s: Student) => s.gender || '-' },
                {
                  header: 'Actions',
                  cell: (s: Student) => (
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/erp/students/${s.id}`)}>
                      View Profile <ChevronRight size={16} />
                    </Button>
                  ),
                },
              ]}
              data={classData.students || []}
              keyExtractor={(s) => s.id}
              emptyMessage="No students are enrolled in this class."
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add Subjects">
        <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-2)' }}>Select Default Subjects</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', maxHeight: '200px', overflowY: 'auto', padding: 'var(--space-2)', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)' }}>
              {['Marathi', 'Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Environmental Studies', 'Computer', 'Physical Education'].map(sub => (
                <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" name="defaultSubjects" value={sub} />
                  {sub}
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: 'var(--space-4)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-2)' }}>Or Add Custom Subject</h4>
            <Input label="Subject Name" name="customName" placeholder="e.g., General Knowledge" />
            <Input label="Subject Code" name="customCode" placeholder="Optional" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsSubjectModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Subjects</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={assignTeacherModal.isOpen} onClose={() => setAssignTeacherModal({ isOpen: false })} title="Assign Teacher">
        <form onSubmit={handleAssignTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Select label="Select Teacher" name="teacherId" required>
            <option value="">-- Choose a Teacher --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.qualification || 'No Qual.'})</option>
            ))}
          </Select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button type="button" variant="ghost" onClick={() => setAssignTeacherModal({ isOpen: false })}>Cancel</Button>
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAssignStudentModalOpen} onClose={() => setIsAssignStudentModalOpen(false)} title="Bulk Assign Students">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '60vh' }}>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>
            Select unassigned students below to enroll them in {classData.name} {classData.division}.
          </p>
          <div style={{ overflowY: 'auto', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)' }}>
            {unassignedStudents.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-neutral-500)' }}>No unassigned students found.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {unassignedStudents.map(s => (
                  <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                    <input 
                      type="checkbox" 
                      id={`chk-${s.id}`} 
                      checked={selectedStudentIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStudentIds(prev => [...prev, s.id]);
                        else setSelectedStudentIds(prev => prev.filter(id => id !== s.id));
                      }}
                    />
                    <label htmlFor={`chk-${s.id}`} style={{ flex: 1, cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ fontWeight: 'var(--font-medium)' }}>{s.firstName} {s.lastName}</span>
                      <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-xs)', marginLeft: 8 }}>{s.admissionNumber}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
              {selectedStudentIds.length} selected
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button type="button" variant="ghost" onClick={() => setIsAssignStudentModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignStudents} disabled={selectedStudentIds.length === 0}>Assign Students</Button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
