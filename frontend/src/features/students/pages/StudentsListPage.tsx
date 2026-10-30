import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, User } from 'lucide-react';
import { Button, DataTable, Badge, Modal, Input, Select, useToast } from '@/components/ui';
import { studentsApi, Student } from '../api/students';
import { classesApi, Class } from '../../classes/api/classes';

export function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const [res, classesRes] = await Promise.all([
        studentsApi.getStudents(),
        classesApi.getClasses().catch(() => [])
      ]);
      setStudents(res.data);
      setClasses(classesRes);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const rawDob = formData.get('dateOfBirth') as string;
    
    const rawGender = formData.get('gender') as string;
    const data = {
      admissionNumber: (formData.get('admissionNumber') as string)?.trim(),
      firstName: (formData.get('firstName') as string)?.trim(),
      lastName: (formData.get('lastName') as string)?.trim(),
      gender: rawGender && ['MALE', 'FEMALE', 'OTHER'].includes(rawGender) 
        ? (rawGender as 'MALE' | 'FEMALE' | 'OTHER') 
        : undefined,
      dateOfBirth: rawDob ? new Date(rawDob).toISOString() : undefined,
      email: (formData.get('email') as string)?.trim() || undefined,
      academicYear: (formData.get('academicYear') as string)?.trim(),
      classId: (formData.get('classId') as string)?.trim() || undefined,
    };

    try {
      await studentsApi.createStudent(data);
      toast.success('Student added successfully');
      setIsModalOpen(false);
      fetchStudents();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add student';
      const details = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '';
      toast.error(`${errorMsg} ${details}`);
    }
  };

  const columns = [
    { header: 'Admission No', accessorKey: 'admissionNumber' as keyof Student },
    { 
      header: 'Name', 
      cell: (s: Student) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} />
          </div>
          <span style={{ fontWeight: 'var(--font-medium)' }}>{s.firstName} {s.lastName}</span>
        </div>
      )
    },
    { header: 'Gender', cell: (s: Student) => s.gender ? s.gender.charAt(0) + s.gender.slice(1).toLowerCase() : '-' },
    { header: 'Class', cell: (s: Student) => s.class ? `${s.class.name} ${s.class.division || ''}` : 'Unassigned' },
    { header: 'Account', cell: (s: Student) => (
      s.user ? <Badge variant="success">Provisioned</Badge> : <Badge variant="neutral">None</Badge>
    ) },
    {
      header: 'Actions',
      cell: (s: Student) => (
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation(); // prevent row click
          navigate(`/erp/students/${s.id}`);
        }}>
          View Profile <ChevronRight size={16} />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>Students Directory</h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>Manage all enrolled students</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Student
        </Button>
      </div>

      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading students...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={students} 
            keyExtractor={(s) => s.id} 
            emptyMessage="No students found."
            onRowClick={(s) => navigate(`/erp/students/${s.id}`)}
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student">
        <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="First Name" name="firstName" required />
            <Input label="Last Name" name="lastName" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Admission Number" name="admissionNumber" required />
            <Input label="Academic Year" name="academicYear" defaultValue="2026-2027" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Date of Birth" name="dateOfBirth" type="date" />
            <Select label="Gender" name="gender">
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
            <Select label="Class (Optional)" name="classId">
              <option value="">None</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.division}</option>
              ))}
            </Select>
          </div>
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', margin: 'var(--space-2) 0' }}></div>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>Digital Access (Optional)</p>
            <Input 
              label="Student Email Address" 
              name="email" 
              type="email" 
              placeholder="Provide email to auto-provision login account"
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
              If provided, an account will be created with default password "Student@123".
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
