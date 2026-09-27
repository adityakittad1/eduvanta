import { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, Plus } from 'lucide-react';
import { Button, Modal, Input, Select, useToast } from '@/components/ui';
import { resourcesApi, LearningResource } from '../api/resources';
import { classesApi, Class, ClassSubject } from '../../classes/api/classes';
import { useAuth } from '@/store/AuthContext';

export function ResourcesListPage() {
  const toast = useToast();
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const data = await resourcesApi.getResources();
      setResources(data);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    if (isTeacher) {
      classesApi.getClasses().then(setClasses).catch(console.error);
    }
  }, [isTeacher]);

  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    classesApi.getClassById(selectedClassId).then(data => {
      setSubjects(data.subjects || []);
    }).catch(console.error);
  }, [selectedClassId]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await resourcesApi.createResource({
        classId: formData.get('classId') as string,
        subjectId: formData.get('subjectId') as string,
        title: formData.get('title') as string,
        topic: formData.get('topic') as string || undefined,
        description: formData.get('description') as string || undefined,
        fileUrl: fileUrl,
        fileType: formData.get('fileType') as string
      });
      toast.success('Resource uploaded successfully!');
      setIsModalOpen(false);
      setFileUrl('');
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload resource');
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            Learning Resources
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
            Study materials, notes, and documents.
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Plus size={16} /> Upload Material
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {resources.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)' }}>
            <p style={{ color: 'var(--color-neutral-500)' }}>No resources found.</p>
          </div>
        ) : (
          resources.map(resource => (
            <div key={resource.id} style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-600)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>{resource.title}</h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
                    {new Date(resource.createdAt).toLocaleDateString()} &bull; {resource.fileType}
                  </div>
                </div>
              </div>

              <div style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <BookOpen size={14} /> {resource.subject.name} &bull; {resource.class.name} {resource.class.division || ''}
                </div>
                {resource.description && (
                  <p style={{ marginTop: 'var(--space-2)' }}>{resource.description}</p>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                  Uploaded by {resource.teacher.firstName} {resource.teacher.lastName}
                </span>
                <a href={resource.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-primary-600)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', textDecoration: 'none' }}>
                  <Download size={14} /> View
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Learning Material">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Title" name="title" required placeholder="e.g. Chapter 3 Notes" />
          <Input label="Description (Optional)" name="description" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Select label="Class" name="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
              <option value="">Select Class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>)}
            </Select>
            <Select label="Subject" name="subjectId" required disabled={!selectedClassId}>
              <option value="">Select Subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
            <Select label="File Type" name="fileType" required>
              <option value="PDF">PDF Document</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Word Document</option>
              <option value="OTHER">Other</option>
            </Select>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)' }}>Resource File *</label>
              {fileUrl ? (
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-50)', color: 'var(--color-success-700)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                  File uploaded successfully!
                </div>
              ) : (
                <label style={{ cursor: 'pointer', width: '100%' }}>
                  <input 
                    type="file" 
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setIsUploadingFile(true);
                        const { uploadFile } = await import('@/lib/api');
                        const url = await uploadFile(file);
                        setFileUrl(url);
                        toast.success('File uploaded successfully');
                      } catch {
                        toast.error('Failed to upload file');
                      } finally {
                        setIsUploadingFile(false);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: 'var(--space-4)', border: '2px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', background: 'var(--color-neutral-50)' }}>
                    <Button variant="secondary" type="button" disabled={isUploadingFile} style={{ pointerEvents: 'none' }}>
                      {isUploadingFile ? 'Uploading...' : 'Click to Upload Material File'}
                    </Button>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setFileUrl(''); }}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!fileUrl}>Upload Material</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
