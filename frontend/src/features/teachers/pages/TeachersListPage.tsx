import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Briefcase } from 'lucide-react';
import { Button, DataTable, Badge, Modal, Input, useToast } from '@/components/ui';
import { teachersApi, Teacher } from '../api/teachers';

export function TeachersListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await teachersApi.getTeachers();
      setTeachers(res.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      employeeId: formData.get('employeeId') as string || undefined,
      qualification: formData.get('qualification') as string || undefined,
    };

    try {
      await teachersApi.createTeacher(data);
      toast.success('Teacher onboarded successfully');
      setIsModalOpen(false);
      fetchTeachers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to onboard teacher');
    }
  };

  const columns = [
    { 
      header: 'Name', 
      cell: (t: Teacher) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={16} />
          </div>
          <div>
            <span style={{ fontWeight: 'var(--font-medium)', display: 'block' }}>{t.firstName} {t.lastName}</span>
            {t.employeeId && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>ID: {t.employeeId}</span>}
          </div>
        </div>
      )
    },
    { header: 'Email', cell: (t: Teacher) => t.user?.email || '-' },
    { header: 'Qualification', cell: (t: Teacher) => t.qualification || '-' },
    { header: 'Status', cell: (t: Teacher) => (
      t.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>
    ) },
    {
      header: 'Actions',
      cell: (t: Teacher) => (
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation(); // prevent row click
          navigate(`/erp/teachers/${t.id}`);
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>Staff Directory</h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>Manage teaching staff and their digital accounts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Onboard Teacher
        </Button>
      </div>

      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading staff...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={teachers} 
            keyExtractor={(t) => t.id} 
            emptyMessage="No teachers found."
            onRowClick={(t) => navigate(`/erp/teachers/${t.id}`)}
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Teacher">
        <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="First Name" name="firstName" required />
            <Input label="Last Name" name="lastName" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Employee ID" name="employeeId" placeholder="Optional" />
            <Input label="Highest Qualification" name="qualification" placeholder="e.g., M.Sc, B.Ed" />
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', margin: 'var(--space-2) 0' }}></div>
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>Digital Access (Required)</h3>
            <Input 
              label="Staff Email Address" 
              name="email" 
              type="email" 
              required
              placeholder="Will be used as their login ID"
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
              A login account will be automatically provisioned with the default password "Teacher@123".
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Onboard Teacher</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
