import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, User, Search, Filter } from 'lucide-react';
import { Button, DataTable, Badge, Modal, Input, Select, Pagination, useToast } from '@/components/ui';
import { studentsApi, Student } from '../api/students';
import { classesApi, Class } from '../../classes/api/classes';

export function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const [res, classesRes] = await Promise.all([
        studentsApi.getStudents(page, limit, selectedClassId || undefined),
        classesApi.getClasses().catch(() => [])
      ]);
      setStudents(res.data);
      if (res.meta) {
        setTotalStudents(res.meta.total);
        setTotalPages(res.meta.totalPages || 1);
      } else {
        setTotalStudents(res.data.length);
        setTotalPages(Math.ceil(res.data.length / limit) || 1);
      }
      setClasses(classesRes);
    } catch {
      toast.error('Failed to fetch students data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, selectedClassId]);

  // Client-side quick filter for active search results
  const filteredStudents = useMemo(() => {
    if (!debouncedSearch) return students;
    const q = debouncedSearch.toLowerCase();
    return students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q)
    );
  }, [students, debouncedSearch]);

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
      academicYear: (formData.get('academicYear') as string)?.trim() || '2026-2027',
      classId: (formData.get('classId') as string)?.trim() || undefined,
    };

    try {
      await studentsApi.createStudent(data);
      toast.success('Student registered successfully');
      setIsModalOpen(false);
      fetchStudents();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add student';
      toast.error(errorMsg);
    }
  };

  const columns = [
    { 
      header: 'Admission No', 
      accessorKey: 'admissionNumber' as keyof Student,
      cell: (s: Student) => (
        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary-700)' }}>
          {s.admissionNumber}
        </span>
      )
    },
    { 
      header: 'Student Name', 
      cell: (s: Student) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ 
            width: 32, 
            height: 32, 
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
            {s.firstName?.[0]?.toUpperCase() || <User size={14} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{s.firstName} {s.lastName}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>{s.academicYear}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Gender', 
      cell: (s: Student) => s.gender ? s.gender.charAt(0) + s.gender.slice(1).toLowerCase() : '-' 
    },
    { 
      header: 'Class / Division', 
      cell: (s: Student) => s.class ? (
        <Badge variant="info">
          {s.class.name} {s.class.division || ''}
        </Badge>
      ) : (
        <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>Unassigned</span>
      ) 
    },
    { 
      header: 'Portal Access', 
      cell: (s: Student) => (
        s.user ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Offline</Badge>
      ) 
    },
    {
      header: 'Action',
      align: 'right' as const,
      cell: (s: Student) => (
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          navigate(`/erp/students/${s.id}`);
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
            Students Directory
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            Manage student admissions, classroom assignments, and profiles ({totalStudents.toLocaleString()} total students)
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Register Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 'var(--space-3)', 
        flexWrap: 'wrap',
        background: 'var(--color-neutral-0)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or admission number..."
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

        {/* Class Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Filter size={15} style={{ color: 'var(--color-neutral-400)' }} />
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              background: 'var(--color-neutral-50)',
              color: 'var(--color-neutral-800)',
              cursor: 'pointer'
            }}
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        columns={columns} 
        data={filteredStudents} 
        keyExtractor={(s) => s.id} 
        emptyMessage={debouncedSearch ? `No students matching "${debouncedSearch}".` : "No student records found."}
        onRowClick={(s) => navigate(`/erp/students/${s.id}`)}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalStudents}
          pageSize={limit}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Register Student Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student">
        <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Input label="First Name" name="firstName" placeholder="e.g. Aarav" required />
            <Input label="Last Name" name="lastName" placeholder="e.g. Patil" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Input label="Admission Number" name="admissionNumber" placeholder="e.g. ADM-2026-001" required />
            <Input label="Academic Year" name="academicYear" defaultValue="2026-2027" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Input label="Date of Birth" name="dateOfBirth" type="date" />
            <Select label="Gender" name="gender">
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <Select label="Assigned Class (Optional)" name="classId">
            <option value="">None (Unassigned)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>
            ))}
          </Select>

          <div style={{ borderTop: '1px solid var(--color-neutral-200)', margin: 'var(--space-2) 0' }} />

          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: 4 }}>
              Digital Access & Student Portal (Optional)
            </p>
            <Input 
              label="Student Email Address" 
              name="email" 
              type="email" 
              placeholder="e.g. aarav.patil@school.in"
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 4 }}>
              If an email is provided, an account will be generated with initial credentials.
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

export default StudentsListPage;
