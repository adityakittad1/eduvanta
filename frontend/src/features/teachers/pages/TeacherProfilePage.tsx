import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, ChevronLeft, Edit2, Briefcase, BookOpen } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, useToast } from '@/components/ui';
import { teachersApi, Teacher } from '../api/teachers';
import './TeacherProfilePage.css';

export function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTeacher = async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      const data = await teachersApi.getTeacherById(id);
      setTeacher(data);
    } catch (error) {
      toast.error('Failed to load teacher profile');
      navigate('/erp/teachers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const handleUpdateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      employeeId: formData.get('employeeId') as string,
      qualification: formData.get('qualification') as string,
      isActive: formData.get('isActive') === 'true',
    };

    try {
      await teachersApi.updateTeacher(id, data);
      toast.success('Teacher updated successfully');
      setIsEditModalOpen(false);
      fetchTeacher();
    } catch (error) {
      toast.error('Failed to update teacher');
    }
  };

  if (isLoading) return <div className="p-6">Loading teacher...</div>;
  if (!teacher) return <div className="p-6">Teacher not found.</div>;

  return (
    <div className="teacher-profile-page">
      {/* Header */}
      <div className="teach-header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/erp/teachers')} style={{ marginBottom: 'var(--space-4)' }}>
          <ChevronLeft size={16} /> Back to Directory
        </Button>
        <div className="teach-header-content">
          <div className="teach-avatar">
            <User size={40} />
          </div>
          <div className="teach-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h1 className="teach-name">{teacher.firstName} {teacher.lastName}</h1>
              {!teacher.isActive && <Badge variant="danger">Inactive</Badge>}
            </div>
            <p className="teach-subtitle">
              <Briefcase size={14} /> Emp ID: {teacher.employeeId || 'N/A'} &bull; 
              <span style={{ marginLeft: 8 }}>Joined: {new Date(teacher.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="teach-actions">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={16} /> Edit Details
            </Button>
          </div>
        </div>
      </div>

      <div className="teach-grid">
        {/* Left Col: Info */}
        <div className="teach-card">
          <h2 className="teach-card-title">Professional Information</h2>
          <ul className="teach-info-list">
            <li>
              <span className="teach-info-label">Full Name</span>
              <span className="teach-info-value">{teacher.firstName} {teacher.lastName}</span>
            </li>
            <li>
              <span className="teach-info-label">Qualification</span>
              <span className="teach-info-value">{teacher.qualification || 'Not specified'}</span>
            </li>
            <li>
              <span className="teach-info-label">Employee ID</span>
              <span className="teach-info-value">{teacher.employeeId || '-'}</span>
            </li>
            <li>
              <span className="teach-info-label">Digital Login Email</span>
              <span className="teach-info-value">
                {teacher.user ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Badge variant={teacher.user.isActive ? "success" : "danger"}>
                      <Mail size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> 
                      {teacher.user.email}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="neutral">Not Provisioned</Badge>
                )}
              </span>
            </li>
          </ul>
        </div>

        {/* Right Col: Class/Subjects */}
        <div className="teach-side-col">
          <div className="teach-card teach-placeholder-card">
            <h2 className="teach-card-title">Assigned Classes & Subjects</h2>
            {teacher.teacherClassSubjects && teacher.teacherClassSubjects.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {teacher.teacherClassSubjects.map(tcs => (
                  <li key={tcs.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>{tcs.subject.name}</div>
                    <div style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>
                      {tcs.class.name} {tcs.class.division || ''}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="teach-empty-state">
                <BookOpen size={24} className="text-neutral-300" />
                <p>No subjects assigned yet.</p>
                <p style={{ fontSize: 'var(--text-xs)' }}>Subject assignments will be managed in Phase 7.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Teacher Details">
        <form onSubmit={handleUpdateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="First Name" name="firstName" defaultValue={teacher.firstName} required />
            <Input label="Last Name" name="lastName" defaultValue={teacher.lastName} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Employee ID" name="employeeId" defaultValue={teacher.employeeId || ''} />
            <Input label="Highest Qualification" name="qualification" defaultValue={teacher.qualification || ''} />
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', margin: 'var(--space-2) 0' }}></div>
          <Select label="Staff Status" name="isActive" defaultValue={teacher.isActive ? 'true' : 'false'}>
            <option value="true">Active (Currently Employed)</option>
            <option value="false">Inactive (Suspended/Resigned)</option>
          </Select>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
            Marking a staff member as inactive will automatically disable their digital login access.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
