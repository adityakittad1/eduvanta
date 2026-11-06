import { useState, useEffect } from 'react';
import { Bell, Plus, Calendar, User, Trash2 } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, EmptyState, useToast } from '@/components/ui';
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await noticesApi.getNotices();
      setNotices(data);
    } catch {
      toast.error('Failed to load notices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (canCreate) {
      classesApi.getClasses().then(setClasses).catch(() => {});
    }
  }, [canCreate]);

  const handleDeleteNotice = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setDeletingId(id);
      await noticesApi.deleteNotice(id);
      toast.success('Notice deleted successfully');
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete notice');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get('title') as string)?.trim();
    const content = (formData.get('content') as string)?.trim();
    const targetClassId = audience === 'CLASS' ? (formData.get('targetClassId') as string) : undefined;

    if (!title) {
      toast.error('Notice title is required');
      return;
    }
    if (!content) {
      toast.error('Notice announcement details are required');
      return;
    }
    if (audience === 'CLASS' && !targetClassId) {
      toast.error('Please select a target class for class-specific notice');
      return;
    }

    try {
      await noticesApi.createNotice({
        title,
        content,
        targetAudience: audience,
        targetClassId,
        visibility,
      });
      toast.success('Notice published successfully');
      setIsModalOpen(false);
      setVisibility('INTERNAL');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create notice');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Notice Board & Announcements
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            Official school circulars, academic alerts, and community updates ({notices.length} notices)
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Plus size={16} /> Post Notice
          </Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} />}
          title="No notices published yet"
          description="When faculty or administrators publish school announcements, they will appear here."
          action={canCreate ? { label: "Post First Notice", onClick: () => setIsModalOpen(true) } : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {notices.map(notice => (
            <div 
              key={notice.id} 
              style={{ 
                background: 'var(--color-neutral-0)', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--color-neutral-200)', 
                padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-xs)',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-2)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-full)' }}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                      {notice.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 2, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} /> {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span>&bull;</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={13} /> {notice.createdBy.email.split('@')[0]}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Badge variant="neutral">
                    {notice.targetAudience === 'ALL' && 'Entire School'}
                    {notice.targetAudience === 'TEACHERS' && 'Staff Only'}
                    {notice.targetAudience === 'STUDENTS' && 'Students Only'}
                    {notice.targetAudience === 'CLASS' && `Class ${notice.targetClass?.name || ''} ${notice.targetClass?.division || ''}`}
                  </Badge>
                  {notice.visibility === 'PUBLIC' && (
                    <Badge variant="success">Public Web</Badge>
                  )}
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(notice.id, notice.title)}
                      disabled={deletingId === notice.id}
                      title="Delete Notice"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-neutral-400)',
                        cursor: deletingId === notice.id ? 'not-allowed' : 'pointer',
                        padding: '4px 6px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color var(--transition-fast), background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger-600)'; e.currentTarget.style.background = 'var(--color-danger-50)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-neutral-400)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ color: 'var(--color-neutral-700)', fontSize: 'var(--text-sm)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {notice.content}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish School Notice">
        <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Notice Title" name="title" required placeholder="e.g. Mid-Term Examination Schedule & Guidelines" />
          
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 'var(--space-1)' }}>
              Announcement Details
            </label>
            <textarea 
              name="content" 
              required 
              rows={4}
              placeholder="Provide complete notice details, dates, and instructions..."
              style={{ 
                width: '100%', 
                padding: 'var(--space-3)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--color-neutral-300)', 
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Select label="Target Audience" value={audience} onChange={(e: any) => setAudience(e.target.value)} required>
              <option value="ALL">Entire Campus (All)</option>
              <option value="STUDENTS">Students & Parents Only</option>
              <option value="TEACHERS">Faculty & Staff Only</option>
              <option value="CLASS">Specific Class / Section</option>
            </Select>

            <Select label="Broadcast Scope" value={visibility} onChange={(e: any) => setVisibility(e.target.value)} required>
              <option value="INTERNAL">Internal ERP Only</option>
              <option value="PUBLIC">Public (Include on Public School Website)</option>
            </Select>
          </div>

          {audience === 'CLASS' && (
            <Select label="Select Target Class" name="targetClassId" required>
              <option value="">Select class division...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.division || ''}</option>)}
            </Select>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Publish Notice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default NoticesListPage;
