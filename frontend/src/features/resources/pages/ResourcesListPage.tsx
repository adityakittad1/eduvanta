import { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, Plus, User, Calendar } from 'lucide-react';
import { Button, Modal, Input, Select, EmptyState, useToast } from '@/components/ui';
import { resourcesApi, LearningResource } from '../api/resources';
import { classesApi, Class, ClassSubject } from '../../classes/api/classes';
import { useAuth } from '@/store/AuthContext';

export function ResourcesListPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canUpload = user?.role === 'TEACHER' || user?.role === 'PRINCIPAL';

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const data = await resourcesApi.getResources();
      setResources(data);
    } catch {
      toast.error('Failed to load learning resources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    if (canUpload) {
      classesApi.getClasses().then(setClasses).catch(() => {});
    }
  }, [canUpload]);

  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    classesApi.getClassById(selectedClassId).then(data => {
      setSubjects(data.subjects || []);
    }).catch(() => {});
  }, [selectedClassId]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await resourcesApi.createResource({
        classId: formData.get('classId') as string,
        subjectId: formData.get('subjectId') as string,
        title: (formData.get('title') as string)?.trim(),
        topic: (formData.get('topic') as string)?.trim() || undefined,
        description: (formData.get('description') as string)?.trim() || undefined,
        fileUrl: fileUrl || 'https://example.com/demo-doc.pdf',
        fileType: (formData.get('fileType') as string) || 'PDF'
      });
      toast.success('Resource published successfully');
      setIsModalOpen(false);
      setFileUrl('');
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload resource');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Digital Learning Resources
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            Curriculum materials, study guides, and digital reference documents ({resources.length} resources)
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Plus size={16} /> Upload Material
          </Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No resources found"
          description="Subject study guides and educational documents uploaded by teachers will appear here."
          action={canUpload ? { label: "Upload First Resource", onClick: () => setIsModalOpen(true) } : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {resources.map(resource => (
            <div 
              key={resource.id} 
              style={{ 
                background: 'var(--color-neutral-0)', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--color-neutral-200)', 
                padding: 'var(--space-5)', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xs)',
                transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease'
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-lg)', color: 'var(--color-primary-600)', flexShrink: 0 }}>
                  <FileText size={22} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {resource.title}
                  </h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Calendar size={12} /> {new Date(resource.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span>&bull;</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>{resource.fileType || 'PDF'}</span>
                  </div>
                </div>
              </div>

              <div style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-700)', fontWeight: 500, marginBottom: 4 }}>
                  <BookOpen size={13} style={{ color: 'var(--color-primary-600)' }} /> {resource.subject?.name || 'General'} &bull; {resource.class?.name || 'All'} {resource.class?.division || ''}
                </div>
                {resource.description && (
                  <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {resource.description}
                  </p>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={12} /> {resource.teacher?.firstName || 'Faculty'} {resource.teacher?.lastName || ''}
                </span>
                <a 
                  href={resource.fileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 4, 
                    color: 'var(--color-primary-600)', 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 600, 
                    textDecoration: 'none',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-50)'
                  }}
                >
                  <Download size={13} /> View File
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Learning Material">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Document Title" name="title" required placeholder="e.g. Science Chapter 4 Notes & Formulae" />
          <Input label="Topic / Chapter (Optional)" name="topic" placeholder="e.g. Motion and Gravitation" />
          <Input label="Description (Optional)" name="description" placeholder="Brief overview of the material..." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Select label="Class Division" name="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
              <option value="">Select class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>)}
            </Select>
            <Select label="Subject" name="subjectId" required disabled={!selectedClassId}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Select label="File Format" name="fileType" defaultValue="PDF" required>
              <option value="PDF">PDF Document</option>
              <option value="DOCX">Word Document (.docx)</option>
              <option value="PPTX">Presentation (.pptx)</option>
              <option value="LINK">External Web Link</option>
            </Select>
            <Input 
              label="Resource Document URL" 
              name="fileUrl" 
              value={fileUrl} 
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/document.pdf" 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Publish Resource</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ResourcesListPage;
