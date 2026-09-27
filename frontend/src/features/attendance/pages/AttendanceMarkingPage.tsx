import { useState, useEffect, useMemo } from 'react';
import { Save, CheckCircle, XCircle } from 'lucide-react';
import { Button, Select, Input, useToast } from '@/components/ui';
import { classesApi, Class } from '../../classes/api/classes';
import { attendanceApi, AttendanceStatus } from '../api/attendance';
import { Student } from '../../students/api/students';

export function AttendanceMarkingPage() {
  const toast = useToast();
  
  // Selection State
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    classesApi.getClasses()
      .then(data => {
        setClasses(data);
        if (data.length > 0) setSelectedClassId(data[0].id);
      })
      .catch(() => toast.error('Failed to load classes'))
      .finally(() => setIsLoadingClasses(false));
  }, []);

  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;
    
    setIsFetchingData(true);
    
    Promise.all([
      classesApi.getClassById(selectedClassId),
      attendanceApi.getDailyAttendance(selectedClassId, selectedDate)
    ])
      .then(([classData, existingRecords]) => {
        const enrolled = classData.students || [];
        setStudents(enrolled);
        
        // Initialize state
        const newState: Record<string, AttendanceStatus> = {};
        
        enrolled.forEach(student => {
          // Find existing record
          const record = existingRecords.find(r => r.studentId === student.id);
          // Default to PRESENT if no existing record
          newState[student.id] = record ? record.status : 'PRESENT';
        });
        
        setAttendanceState(newState);
      })
      .catch(() => toast.error('Failed to fetch attendance data'))
      .finally(() => setIsFetchingData(false));
      
  }, [selectedClassId, selectedDate]);

  const handleSave = async () => {
    if (!selectedClassId || !selectedDate) return;
    
    setIsSaving(true);
    
    const records = students.map(s => ({
      studentId: s.id,
      status: attendanceState[s.id]
    }));

    try {
      await attendanceApi.markAttendance(selectedClassId, selectedDate, records);
      toast.success('Attendance saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newState: Record<string, AttendanceStatus> = {};
    students.forEach(s => { newState[s.id] = status; });
    setAttendanceState(newState);
  };

  // Stats
  const stats = useMemo(() => {
    let present = 0, absent = 0;
    Object.values(attendanceState).forEach(status => {
      if (status === 'PRESENT' || status === 'LATE') present++;
      if (status === 'ABSENT') absent++;
    });
    return { present, absent, total: students.length };
  }, [attendanceState, students.length]);

  if (isLoadingClasses) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* Header and Controls */}
      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-6)' }}>Daily Attendance</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'end' }}>
          <Select 
            label="Select Class" 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.division}</option>
            ))}
          </Select>
          
          <Input 
            type="date" 
            label="Date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]} // Can't mark future attendance
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isFetchingData ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-neutral-500)' }}>Fetching student list...</div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
          <p style={{ color: 'var(--color-neutral-500)' }}>No students enrolled in this class yet.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              <span style={{ fontWeight: 'var(--font-medium)' }}>Total: {stats.total}</span>
              <span style={{ color: 'var(--color-success-600)', fontWeight: 'var(--font-semibold)' }}>Present: {stats.present}</span>
              <span style={{ color: 'var(--color-danger-600)', fontWeight: 'var(--font-semibold)' }}>Absent: {stats.absent}</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button size="sm" variant="ghost" onClick={() => markAll('PRESENT')}>Mark All Present</Button>
              <Button size="sm" variant="ghost" onClick={() => markAll('ABSENT')}>Mark All Absent</Button>
            </div>
          </div>

          <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {students.map(student => {
                const isPresent = attendanceState[student.id] === 'PRESENT';
                return (
                  <div 
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isPresent ? 'var(--color-success-200)' : 'var(--color-danger-200)'}`,
                      background: isPresent ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)', color: isPresent ? 'var(--color-success-900)' : 'var(--color-danger-900)' }}>
                        {student.firstName} {student.lastName}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: isPresent ? 'var(--color-success-700)' : 'var(--color-danger-700)' }}>
                        Roll: {student.admissionNumber}
                      </div>
                    </div>
                    
                    <div>
                      {isPresent ? (
                        <CheckCircle size={24} color="var(--color-success-600)" />
                      ) : (
                        <XCircle size={24} color="var(--color-danger-600)" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'flex-end', background: 'var(--color-neutral-0)' }}>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
