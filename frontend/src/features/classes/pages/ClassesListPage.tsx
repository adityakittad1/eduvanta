import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, ChevronRight } from 'lucide-react';
import { Button, Modal, Input, useToast } from '@/components/ui';
import { classesApi, Class } from '../api/classes';

export function ClassesListPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const data = await classesApi.getClasses();
      setClasses(data);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const academicYear = formData.get('academicYear') as string;
    const defaultClasses = formData.getAll('defaultClasses') as string[];
    const customName = formData.get('customName') as string;
    const customDivision = formData.get('customDivision') as string || undefined;

    const classesToCreate: { name: string, division?: string, academicYear: string }[] = [];

    // Add default classes
    defaultClasses.forEach(cls => {
      classesToCreate.push({ name: cls, academicYear });
    });

    // Add custom class if provided
    if (customName && customName.trim() !== '') {
      classesToCreate.push({ name: customName, division: customDivision, academicYear });
    }

    if (classesToCreate.length === 0) {
      toast.error('Please select at least one class or enter a custom class');
      return;
    }

    try {
      // Loop over and create (no bulk API yet, so we do Promise.all)
      await Promise.all(classesToCreate.map(data => classesApi.createClass(data)));
      toast.success(`${classesToCreate.length} class(es) created successfully`);
      setIsModalOpen(false);
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create some classes');
      fetchClasses(); // Refresh anyway to show what succeeded
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>Academic Classes</h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>Manage classes, subjects, and student enrollments</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> New Class
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-neutral-500)' }}>Loading classes...</div>
      ) : classes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
          <BookOpen size={48} color="var(--color-neutral-300)" style={{ margin: '0 auto var(--space-4)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>No classes found</h3>
          <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-4)' }}>Create your first class to start building the academic structure.</p>
          <Button onClick={() => setIsModalOpen(true)}>Create Class</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {classes.map(cls => (
            <div 
              key={cls.id} 
              onClick={() => navigate(`/erp/classes/${cls.id}`)}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
                    {cls.name} {cls.division && <span style={{ color: 'var(--color-neutral-500)' }}>- {cls.division}</span>}
                  </h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 4 }}>
                    {cls.academicYear}
                  </div>
                </div>
                <div style={{ color: 'var(--color-primary-500)', background: 'var(--color-primary-50)', padding: '6px', borderRadius: '50%' }}>
                  <ChevronRight size={18} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-4)', borderTop: '1px solid var(--color-neutral-100)', paddingTop: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-neutral-600)' }}>
                  <Users size={16} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{cls._count?.students || 0} Students</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-neutral-600)' }}>
                  <BookOpen size={16} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{cls._count?.subjects || 0} Subjects</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Classes">
        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-2)' }}>Select Default Classes</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', maxHeight: '200px', overflowY: 'auto', padding: 'var(--space-2)', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)' }}>
              {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                <label key={cls} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" name="defaultClasses" value={cls} />
                  {cls}
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: 'var(--space-4)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-2)' }}>Or Add Custom Class</h4>
            <Input label="Custom Class Name" name="customName" placeholder="e.g., Grade 11" />
            <Input label="Division / Section" name="customDivision" placeholder="e.g., A, Science (Optional)" />
          </div>
          
          <Input label="Academic Year" name="academicYear" defaultValue={new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Classes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
