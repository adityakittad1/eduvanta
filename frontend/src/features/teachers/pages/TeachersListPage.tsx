import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Briefcase, Search } from 'lucide-react';
import { Button, DataTable, Badge, Modal, Input, Pagination, useToast } from '@/components/ui';
import { teachersApi, Teacher } from '../api/teachers';

export function TeachersListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await teachersApi.getTeachers(page, limit);
      setTeachers(res.data);
      if (res.meta) {
        setTotalTeachers(res.meta.total);
        setTotalPages(res.meta.totalPages || 1);
      } else {
        setTotalTeachers(res.data.length);
        setTotalPages(Math.ceil(res.data.length / limit) || 1);
      }
    } catch {
      toast.error('Failed to fetch teachers directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page]);

  const filteredTeachers = useMemo(() => {
    if (!debouncedSearch) return teachers;
    const q = debouncedSearch.toLowerCase();
    return teachers.filter(t =>
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      (t.employeeId && t.employeeId.toLowerCase().includes(q)) ||
      (t.user?.email && t.user.email.toLowerCase().includes(q))
    );
  }, [teachers, debouncedSearch]);

  const handleCreateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: (formData.get('email') as string)?.trim(),
      firstName: (formData.get('firstName') as string)?.trim(),
      lastName: (formData.get('lastName') as string)?.trim(),
      employeeId: (formData.get('employeeId') as string)?.trim() || undefined,
      qualification: (formData.get('qualification') as string)?.trim() || undefined,
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
      header: 'Teacher Name', 
      cell: (t: Teacher) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ 
            width: 34, 
            height: 34, 
            borderRadius: 'var(--radius-full)', 
            background: 'var(--color-primary-50)', 
            color: 'var(--color-primary-600)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {t.firstName?.[0]?.toUpperCase() || <Briefcase size={15} />}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--color-neutral-900)', display: 'block' }}>
              {t.firstName} {t.lastName}
            </span>
            {t.employeeId && (
              <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>
                {t.employeeId}
              </span>
            )}
          </div>
        </div>
      )
    },
    { 
      header: 'Email / Account', 
      cell: (t: Teacher) => t.user?.email ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)' }}>{t.user.email}</span>
      ) : (
        <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>No account</span>
      )
    },
    { 
      header: 'Qualification', 
      cell: (t: Teacher) => t.qualification ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)' }}>{t.qualification}</span>
      ) : (
        <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>-</span>
      )
    },
    { 
      header: 'Status', 
      cell: (t: Teacher) => (
        t.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>
      ) 
    },
    {
      header: 'Action',
      align: 'right' as const,
      cell: (t: Teacher) => (
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          navigate(`/erp/teachers/${t.id}`);
        }}>
          Profile <ChevronRight size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Teaching Staff Directory
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            Manage faculty profiles, employee IDs, and portal accounts ({totalTeachers.toLocaleString()} faculty members)
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Onboard Teacher
        </Button>
      </div>

      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 'var(--space-3)',
        background: 'var(--color-neutral-0)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by faculty name or employee ID..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              background: 'var(--color-neutral-50)',
              color: 'var(--color-neutral-900)'
            }}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        columns={columns} 
        data={filteredTeachers} 
        keyExtractor={(t) => t.id} 
        emptyMessage={debouncedSearch ? `No faculty members matching "${debouncedSearch}".` : "No teaching staff records found."}
        onRowClick={(t) => navigate(`/erp/teachers/${t.id}`)}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalTeachers}
          pageSize={limit}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Faculty Member">
        <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Input label="First Name" name="firstName" placeholder="e.g. Ramesh" required />
            <Input label="Last Name" name="lastName" placeholder="e.g. Deshmukh" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Input label="Employee ID" name="employeeId" placeholder="e.g. EMP-2026-042" />
            <Input label="Highest Qualification" name="qualification" placeholder="e.g. M.Sc., B.Ed." />
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', margin: 'var(--space-2) 0' }} />
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: 4 }}>
              Digital Portal Access (Required)
            </p>
            <Input 
              label="Staff Email Address" 
              name="email" 
              type="email" 
              required
              placeholder="e.g. ramesh.deshmukh@school.in"
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 4 }}>
              An authentication account will be provisioned with the initial password "Teacher@123".
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Onboard Faculty</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TeachersListPage;
