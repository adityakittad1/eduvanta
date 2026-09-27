import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Phone, MapPin, Hash, GraduationCap, ChevronLeft, Edit2, AlertTriangle } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, useToast } from '@/components/ui';
import { studentsApi, Student } from '../api/students';
import { attendanceApi, StudentAttendanceStats } from '../../attendance/api/attendance';
import { academicsApi, StudentAcademicResponse } from '../../academics/api/academics';
import { useAuth } from '@/store/AuthContext';
import './StudentProfilePage.css';

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<StudentAttendanceStats | null>(null);
  const [academicStats, setAcademicStats] = useState<StudentAcademicResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isPrincipal = user?.role === 'PRINCIPAL';

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      const [data, attData, acadData] = await Promise.all([
        studentsApi.getStudentById(id),
        attendanceApi.getStudentAttendance(id).catch(() => null),
        academicsApi.getStudentAcademics(id).catch(() => null)
      ]);
      setStudent(data);
      if (attData) setAttendanceStats(attData.stats);
      if (acadData) setAcademicStats(acadData);
    } catch (error) {
      toast.error('Failed to load student profile');
      navigate('/erp/students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleUpdateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      gender: formData.get('gender') as any,
      dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      address: formData.get('address') as string,
      guardianName: formData.get('guardianName') as string,
      guardianPhone: formData.get('guardianPhone') as string,
      isActive: formData.get('isActive') === 'true',
    };

    try {
      await studentsApi.updateStudent(id, data);
      toast.success('Student updated');
      setIsEditModalOpen(false);
      fetchStudent();
    } catch (error) {
      toast.error('Failed to update student');
    }
  };

  if (isLoading) return <div className="p-6">Loading student...</div>;
  if (!student) return <div className="p-6">Student not found.</div>;

  const age = student.dateOfBirth 
    ? Math.floor((new Date().getTime() - new Date(student.dateOfBirth).getTime()) / 3.15576e+10)
    : null;

  return (
    <div className="student-profile-page">
      {/* Header */}
      <div className="stu-header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/erp/students')} style={{ marginBottom: 'var(--space-4)' }}>
          <ChevronLeft size={16} /> Back to Directory
        </Button>
        <div className="stu-header-content">
          <div className="stu-avatar">
            <User size={40} />
          </div>
          <div className="stu-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h1 className="stu-name">{student.firstName} {student.lastName}</h1>
              {!student.isActive && <Badge variant="danger">Inactive</Badge>}
            </div>
            <p className="stu-subtitle">
              <Hash size={14} /> Adm. No: {student.admissionNumber} &bull; 
              <GraduationCap size={14} style={{ marginLeft: 8 }} /> Class: {student.class ? `${student.class.name} ${student.class.division || ''}` : 'Unassigned'}
            </p>
          </div>
          {isPrincipal && (
            <div className="stu-actions">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 size={16} /> Edit Student
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Early Warning Banner */}
      {student.earlyWarningFlags && student.earlyWarningFlags.length > 0 && (
        <div className="stu-warning-banner">
          <AlertTriangle size={20} className="text-danger-600" />
          <div>
            <h4 style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-danger-700)' }}>Requires Attention</h4>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', marginTop: 'var(--space-1)', color: 'var(--color-danger-600)' }}>
              {student.earlyWarningFlags.map(f => (
                <li key={f.id}>{f.flagType.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="stu-grid">
        {/* Left Col: Personal Info */}
        <div className="stu-card">
          <h2 className="stu-card-title">Personal Information</h2>
          <ul className="stu-info-list">
            <li>
              <span className="stu-info-label">Gender</span>
              <span className="stu-info-value">{student.gender ? student.gender.charAt(0) + student.gender.slice(1).toLowerCase() : '-'}</span>
            </li>
            <li>
              <span className="stu-info-label">Date of Birth</span>
              <span className="stu-info-value">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                {age ? ` (${age} years)` : ''}
              </span>
            </li>
            <li>
              <span className="stu-info-label">Address</span>
              <span className="stu-info-value" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} className="text-neutral-400" /> {student.address || '-'}
              </span>
            </li>
          </ul>
          
          <h3 className="stu-card-subtitle">Guardian Information</h3>
          <ul className="stu-info-list">
            <li>
              <span className="stu-info-label">Name</span>
              <span className="stu-info-value">{student.guardianName || '-'}</span>
            </li>
            <li>
              <span className="stu-info-label">Phone</span>
              <span className="stu-info-value" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={14} className="text-neutral-400" /> {student.guardianPhone || '-'}
              </span>
            </li>
          </ul>
        </div>

        {/* Right Col: Academics & Account Overview */}
        <div className="stu-side-col">
          <div className="stu-card">
            <h2 className="stu-card-title">Enrollment & Account</h2>
            <ul className="stu-info-list">
              <li>
                <span className="stu-info-label">Academic Year</span>
                <span className="stu-info-value">{student.academicYear}</span>
              </li>
              <li>
                <span className="stu-info-label">Enrolled On</span>
                <span className="stu-info-value">{new Date(student.createdAt).toLocaleDateString()}</span>
              </li>
              <li>
                <span className="stu-info-label">Digital Access</span>
                <span className="stu-info-value">
                  {student.user ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Badge variant="success">
                        <Mail size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> 
                        {student.user.email}
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="neutral">Not Provisioned</Badge>
                  )}
                </span>
              </li>
            </ul>
          </div>

          {/* Attendance Overview */}
          <div className={`stu-card ${!attendanceStats ? 'stu-placeholder-card' : ''}`}>
            <h2 className="stu-card-title">Attendance Overview</h2>
            {!attendanceStats ? (
              <div className="stu-empty-state">
                <Calendar size={24} className="text-neutral-300" />
                <p>No attendance data recorded yet.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'var(--font-bold)', lineHeight: 1, color: attendanceStats.percentage >= 75 ? 'var(--color-success-600)' : 'var(--color-danger-600)' }}>
                    {attendanceStats.percentage}%
                  </span>
                  <span style={{ color: 'var(--color-neutral-500)', paddingBottom: 4 }}>overall attendance</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                  <div>
                    <div style={{ color: 'var(--color-neutral-500)' }}>Total Days</div>
                    <div style={{ fontWeight: 'var(--font-semibold)' }}>{attendanceStats.totalDays}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-neutral-500)' }}>Present</div>
                    <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-success-600)' }}>{attendanceStats.presentDays}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-neutral-500)' }}>Absent</div>
                    <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-danger-600)' }}>{attendanceStats.absentDays}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Academic Performance */}
          <div className={`stu-card ${!academicStats || academicStats.records.length === 0 ? 'stu-placeholder-card' : ''}`}>
            <h2 className="stu-card-title">Academic Performance</h2>
            {!academicStats || academicStats.records.length === 0 ? (
              <div className="stu-empty-state">
                <GraduationCap size={24} className="text-neutral-300" />
                <p>No academic records found.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'var(--font-bold)', lineHeight: 1, color: (academicStats.averagePercentage || 0) >= 40 ? 'var(--color-success-600)' : 'var(--color-danger-600)' }}>
                    {academicStats.averagePercentage || 0}%
                  </span>
                  <span style={{ color: 'var(--color-neutral-500)', paddingBottom: 4 }}>overall average</span>
                </div>
                
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>Recent Assessments</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {academicStats.records.slice(0, 5).map(record => (
                    <li key={record.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>{record.assessment.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>{record.assessment.subject?.name}</div>
                      </div>
                      <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-primary-600)' }}>
                        {record.marksObtained} / {record.assessment.maxMarks}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student">
        <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="First Name" name="firstName" defaultValue={student.firstName} required />
            <Input label="Last Name" name="lastName" defaultValue={student.lastName} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Date of Birth" name="dateOfBirth" type="date" defaultValue={student.dateOfBirth ? student.dateOfBirth.split('T')[0] : ''} />
            <Select label="Gender" name="gender" defaultValue={student.gender || ''}>
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <Input label="Address" name="address" defaultValue={student.address || ''} />
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', margin: 'var(--space-2) 0' }}></div>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>Guardian Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Guardian Name" name="guardianName" defaultValue={student.guardianName || ''} />
            <Input label="Guardian Phone" name="guardianPhone" defaultValue={student.guardianPhone || ''} />
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', margin: 'var(--space-2) 0' }}></div>
          <Select label="Status" name="isActive" defaultValue={student.isActive ? 'true' : 'false'}>
            <option value="true">Active (Enrolled)</option>
            <option value="false">Inactive (Suspended/Transferred)</option>
          </Select>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
