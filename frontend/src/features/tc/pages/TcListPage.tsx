import { useState, useEffect } from 'react';
import { FileText, Check, X, FileSignature, Download } from 'lucide-react';
import { Button, Badge, Modal, Input, useToast } from '@/components/ui';
import { tcApi, TransferCertificate } from '../api/tc';
import { studentsApi, Student } from '../../students/api/students';
import { useAuth } from '@/store/AuthContext';

import { TcTemplateManager } from '../components/TcTemplateManager';
import { tcTemplateApi } from '../api/tc-template';

export function TcListPage() {
  const toast = useToast();
  const { user } = useAuth();
  const isPrincipal = user?.role === 'PRINCIPAL';
  const isStudent = user?.role === 'STUDENT';

  const [tcs, setTcs] = useState<TransferCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'GENERATED' | 'TEMPLATES'>('REQUESTS');

  // Student Search for Principal
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedTc, setSelectedTc] = useState<TransferCertificate | null>(null);
  const [tcFileUrl, setTcFileUrl] = useState('');
  const [isUploadingTc, setIsUploadingTc] = useState(false);

  const fetchTcs = async () => {
    try {
      setIsLoading(true);
      const data = await tcApi.getTcs();
      setTcs(data);
    } catch (error) {
      toast.error('Failed to load TCs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTcs();
  }, []);

  useEffect(() => {
    if (isModalOpen && !isStudent && students.length === 0) {
      studentsApi.getStudents(1, 1000).then(res => setStudents(res.data)).catch(() => {});
    }
  }, [isModalOpen, isStudent]);

  const handleRequestTc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      if (isStudent) {
        await tcApi.requestTc(formData.get('reason') as string);
      } else {
        if (!selectedStudentId) {
          toast.error('Please select a student from the list');
          return;
        }
        await tcApi.requestTcForStudent(selectedStudentId, formData.get('reason') as string);
      }
      toast.success('TC requested successfully!');
      setIsModalOpen(false);
      fetchTcs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to request TC');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await tcApi.updateStatus(id, 'APPROVED');
      toast.success('TC Approved');
      fetchTcs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this TC request?')) return;
    try {
      await tcApi.updateStatus(id, 'CANCELLED');
      toast.success('TC Cancelled');
      fetchTcs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
    }
  };

  const handleIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTc) return;
    const formData = new FormData(e.currentTarget);
    try {
      await tcApi.updateStatus(selectedTc.id, 'ISSUED', formData.get('fileUrl') as string);
      toast.success('TC Issued successfully!');
      setIsIssueModalOpen(false);
      setSelectedTc(null);
      setTcFileUrl('');
      fetchTcs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to issue TC');
    }
  };

  const handleGenerateTemplate = async (tc: TransferCertificate) => {
    try {
      toast.info('Generating TC document from template...');
      const updatedTc = await tcTemplateApi.generateTc(tc.id);
      
      // Update local state to show as ISSUED
      setTcs(prev => prev.map(t => t.id === tc.id ? { ...t, ...updatedTc } : t));
      toast.success('TC Generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate TC (ensure an active template exists)');
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            Transfer Certificates
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
            {isPrincipal ? 'Manage TC requests and issue certificates.' : 'Request and view your transfer certificate.'}
          </p>
        </div>
        <Button onClick={() => {
          setIsModalOpen(true);
          setStudentSearch('');
          setSelectedStudentId('');
        }} variant="primary">
          <FileSignature size={16} /> Request TC
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--color-neutral-200)' }}>
        <button
          onClick={() => setActiveTab('REQUESTS')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'REQUESTS' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            color: activeTab === 'REQUESTS' ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            fontWeight: activeTab === 'REQUESTS' ? 'var(--font-semibold)' : 'var(--font-regular)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            marginBottom: -1,
            transition: 'all 150ms ease',
          }}
        >
          Pending &amp; Approved
        </button>
        <button
          onClick={() => setActiveTab('GENERATED')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'GENERATED' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            color: activeTab === 'GENERATED' ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            fontWeight: activeTab === 'GENERATED' ? 'var(--font-semibold)' : 'var(--font-regular)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            marginBottom: -1,
            transition: 'all 150ms ease',
          }}
        >
          Generated TCs
        </button>
        {isPrincipal && (
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'TEMPLATES' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              color: activeTab === 'TEMPLATES' ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
              fontWeight: activeTab === 'TEMPLATES' ? 'var(--font-semibold)' : 'var(--font-regular)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              marginBottom: -1,
              transition: 'all 150ms ease',
            }}
          >
            TC Templates
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {activeTab === 'TEMPLATES' ? (
          <TcTemplateManager />
        ) : (
          (() => {
            const filteredTcs = tcs.filter(tc => 
              activeTab === 'GENERATED' ? tc.status === 'ISSUED' : tc.status !== 'ISSUED'
            );

          if (filteredTcs.length === 0) {
            return (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)' }}>
                <p style={{ color: 'var(--color-neutral-500)' }}>No {activeTab === 'GENERATED' ? 'generated TCs' : 'TC requests'} found.</p>
              </div>
            );
          }

          return filteredTcs.map(tc => (
            <div key={tc.id} style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-full)' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>
                      {tc.student.firstName} {tc.student.lastName}
                    </h3>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: '4px' }}>
                      Admn: {tc.student.admissionNumber} &bull; Class {tc.student.class?.name} {tc.student.class?.division || ''}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={
                    tc.status === 'APPROVED' ? 'success' :
                    tc.status === 'ISSUED' ? 'info' :
                    tc.status === 'CANCELLED' ? 'danger' : 'warning'
                  }>
                    {tc.status}
                  </Badge>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
                    TC #: {tc.tcNumber}
                  </div>
                </div>
              </div>

              <div style={{ padding: 'var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)' }}>
                <span style={{ fontWeight: 'var(--font-medium)' }}>Reason:</span> {tc.reason || 'Not specified'}
                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                  Requested: {new Date(tc.requestedDate).toLocaleDateString()}
                  {tc.approvedDate && ` • Approved: ${new Date(tc.approvedDate).toLocaleDateString()}`}
                  {tc.issuedDate && ` • Issued: ${new Date(tc.issuedDate).toLocaleDateString()}`}
                </div>
              </div>

              {isPrincipal && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-neutral-100)' }}>
                  {tc.status === 'REQUESTED' && (
                    <>
                      <Button size="sm" variant="danger" onClick={() => handleReject(tc.id)}>
                        <X size={16} /> Cancel
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => handleApprove(tc.id)}>
                        <Check size={16} /> Approve
                      </Button>
                    </>
                  )}
                  {tc.status === 'APPROVED' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => handleGenerateTemplate(tc)}>
                        <FileText size={16} style={{ marginRight: 6 }} /> Generate TC Document
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => { setSelectedTc(tc); setTcFileUrl(''); setIsIssueModalOpen(true); }}>
                        <FileSignature size={16} /> Upload Signed TC
                      </Button>
                    </>
                  )}
                </div>
              )}
              {tc.status === 'ISSUED' && tc.fileUrl && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                   <a href={tc.fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                     <Button size="sm" variant="secondary">
                        <Download size={16} style={{ marginRight: 6 }} /> Download TC
                     </Button>
                   </a>
                </div>
              )}
            </div>
          ));
          })()
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Transfer Certificate">
        <form onSubmit={handleRequestTc} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {!isStudent && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
               <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)' }}>Student Name *</label>
               <Input 
                 list="students-list"
                 placeholder="Type to search student name..."
                 value={studentSearch}
                 onChange={e => {
                   setStudentSearch(e.target.value);
                   const student = students.find(s => `${s.firstName} ${s.lastName} (${s.admissionNumber})` === e.target.value);
                   if (student) {
                     setSelectedStudentId(student.id);
                   } else {
                     setSelectedStudentId('');
                   }
                 }}
                 required 
               />
               <datalist id="students-list">
                 {students.map(s => (
                   <option key={s.id} value={`${s.firstName} ${s.lastName} (${s.admissionNumber})`} />
                 ))}
               </datalist>
               {selectedStudentId && (
                 <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-600)', marginTop: 4 }}>
                   <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> 
                   Student Selected
                 </p>
               )}
             </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-1)' }}>
              Reason for leaving
            </label>
            <textarea 
              name="reason" 
              required 
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', minHeight: 80 }}
            ></textarea>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Request</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue Transfer Certificate">
        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
            After you've printed the TC Document and the Principal has signed it, upload the scanned PDF/Image here to finalize the TC in the ERP.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {tcFileUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-success-50)', color: 'var(--color-success-700)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                <Check size={16} /> Signed document uploaded. Ready to issue!
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <label style={{ cursor: 'pointer', width: '100%' }}>
                  <input 
                    type="file" 
                    accept=".pdf,image/*" 
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setIsUploadingTc(true);
                        const { uploadFile } = await import('@/lib/api');
                        const url = await uploadFile(file);
                        setTcFileUrl(url);
                        toast.success('TC file uploaded temporarily');
                      } catch {
                        toast.error('Failed to upload TC file');
                      } finally {
                        setIsUploadingTc(false);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: 'var(--space-6)', border: '2px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', background: 'var(--color-neutral-50)' }}>
                    <Button variant="secondary" type="button" disabled={isUploadingTc} style={{ pointerEvents: 'none' }}>
                      {isUploadingTc ? 'Uploading...' : 'Click to Upload Signed TC (.pdf, .jpg)'}
                    </Button>
                  </div>
                </label>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => { setIsIssueModalOpen(false); setTcFileUrl(''); }}>Cancel</Button>
            <Button type="submit" variant="primary">Issue Final TC</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
