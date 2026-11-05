import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, ChevronRight } from 'lucide-react';
import { Button, Modal, Input, EmptyState, useToast } from '@/components/ui';
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
    } catch {
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
      await Promise.all(classesToCreate.map(data => classesApi.createClass(data)));
      toast.success(`${classesToCreate.length} class(es) created successfully`);
      setIsModalOpen(false);
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create some classes');
      fetchClasses();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Academic Classes & Divisions</h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            Manage grade levels, subject curriculum, and student enrollment divisions ({classes.length} active classes)
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> New Class
        </Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No classes found"
          description="Create your first class to build the school's academic structure and enroll students."
          action={{ label: "Create Class", onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {classes.map(cls => (
            <div 
              key={cls.id} 
              onClick={() => navigate(`/erp/classes/${cls.id}`)}
              style={{ 
                background: 'var(--color-neutral-0)', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--color-neutral-200)', 
                padding: 'var(--space-5)',
                cursor: 'pointer',
                transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                boxShadow: 'var(--shadow-xs)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {cls.name} {cls.division && <span style={{ color: 'var(--color-neutral-500)', fontWeight: 500 }}>({cls.division})</span>}
                  </h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 2 }}>
                    AY {cls.academicYear}
                  </div>
                </div>
                <div style={{ color: 'var(--color-primary-600)', background: 'var(--color-primary-50)', padding: 6, borderRadius: 'var(--radius-full)' }}>
                  <ChevronRight size={16} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-4)', borderTop: '1px solid var(--color-neutral-100)', paddingTop: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-neutral-600)' }}>
                  <Users size={15} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{cls._count?.students || 0} Students</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-neutral-600)' }}>
                  <BookOpen size={15} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{cls._count?.subjects || 0} Subjects</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Classes">
        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: 'var(--space-2)' }}>Select Standard Classes</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)', maxHeight: '200px', overflowY: 'auto', padding: 'var(--space-3)', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)' }}>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                <label key={cls} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" name="defaultClasses" value={cls} />
                  {cls}
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: 'var(--space-4)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: 'var(--space-2)' }}>Or Add Custom Class / Division</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <Input label="Custom Class Name" name="customName" placeholder="e.g. Class 11" />
              <Input label="Division / Section" name="customDivision" placeholder="e.g. A or Science" />
            </div>
          </div>
          
          <Input label="Academic Year" name="academicYear" defaultValue="2026-2027" required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Classes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClassesListPage;

