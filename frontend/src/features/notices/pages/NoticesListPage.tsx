import { useState, useEffect } from 'react';
import { Bell, Plus } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, useToast } from '@/components/ui';
import { noticesApi, Notice } from '../api/notices';
import { classesApi, Class } from '../../classes/api/classes';
import { useAuth } from '@/store/AuthContext';

export function NoticesListPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canCreate = user?.role === 'PRINCIPAL' || user?.role === 'TEACHER';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audience, setAudience] = useState<'ALL'|'TEACHERS'|'STUDENTS'|'CLASS'>('ALL');
  const [visibility, setVisibility] = useState<'INTERNAL'|'PUBLIC'>('INTERNAL');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await noticesApi.getNotices();
      setNotices(data);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (canCreate) {
      classesApi.getClasses().then(setClasses).catch(console.error);
    }
  }, [canCreate]);

  const handleCreateNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await noticesApi.createNotice({
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        targetAudience: audience,
        targetClassId: audience === 'CLASS' ? (formData.get('targetClassId') as string) : undefined,
        visibility,
      });
      toast.success('Notice published successfully!');
      setIsModalOpen(false);
      setVisibility('INTERNAL'); // reset
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create notice');
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            Notice Board
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
            Announcements, alerts, and school updates.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Plus size={16} /> New Notice
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {notices.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)' }}>
            <p style={{ color: 'var(--color-neutral-500)' }}>No notices to display.</p>
          </div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-2)', background: 'var(--color-info-50)', color: 'var(--color-info-600)', borderRadius: 'var(--radius-full)' }}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>
                      {notice.title}
                    </h3>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '4px' }}>
                      {new Date(notice.createdAt).toLocaleString()} &bull; By {notice.createdBy.email.split('@')[0]}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Badge variant="neutral">
                    {notice.targetAudience === 'ALL' && 'All'}
                    {notice.targetAudience === 'TEACHERS' && 'Teachers Only'}
                    {notice.targetAudience === 'STUDENTS' && 'Students Only'}
                    {notice.targetAudience === 'CLASS' && `Class ${notice.targetClass?.name} ${notice.targetClass?.division || ''}`}
                  </Badge>
                  {notice.visibility === 'PUBLIC' && (
                    <Badge variant="success">🌐 Public</Badge>
                  )}
                </div>
              </div>

              <div style={{ color: 'var(--color-neutral-700)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {notice.content}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Notice">
        <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Notice Title" name="title" required placeholder="e.g. Tomorrow is a Holiday" />
          
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-1)' }}>
              Content
            </label>
            <textarea 
              name="content" 
              required 
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', minHeight: 120 }}
            ></textarea>
          </div>
          
          <Select label="Target Audience" value={audience} onChange={(e: any) => setAudience(e.target.value)} required>
            <option value="ALL">Entire School</option>
            <option value="STUDENTS">All Students</option>
            <option value="TEACHERS">All Teachers</option>
            <option value="CLASS">Specific Class</option>
          </Select>

          {audience === 'CLASS' && (
            <Select label="Select Class" name="targetClassId" required>
              <option value="">Select...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>)}
            </Select>
          )}

          <Select label="Visibility" value={visibility} onChange={(e: any) => setVisibility(e.target.value)} required>
            <option value="INTERNAL">Internal Only (ERP users)</option>
            <option value="PUBLIC">Public (Also show on school website)</option>
          </Select>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Publish Notice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
