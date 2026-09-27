import { useState, useEffect } from 'react';
import { Plus, Globe, Lock, Check } from 'lucide-react';
import { Button, Modal, Input, Select, useToast } from '@/components/ui';
import { galleryApi, GalleryItem } from '../api/gallery';
import { useAuth } from '@/store/AuthContext';

export function GalleryPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canUpload = user?.role === 'PRINCIPAL' || user?.role === 'TEACHER';

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublicUpload, setIsPublicUpload] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await galleryApi.getGalleryItems();
      setItems(data);
    } catch (error) {
      toast.error('Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await galleryApi.uploadItem({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        fileUrl: fileUrl,
        isPublic: isPublicUpload,
      });
      toast.success('Image added to gallery!');
      setIsModalOpen(false);
      setIsPublicUpload(false);
      setFileUrl('');
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload');
    }
  };

  const handleTogglePublic = async (item: GalleryItem) => {
    try {
      const updated = await galleryApi.togglePublic(item.id, !item.isPublic);
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      toast.success(updated.isPublic ? 'Now visible on public website' : 'Hidden from public website');
    } catch (error: any) {
      toast.error('Failed to update visibility');
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            School Gallery
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>
            Photos of events, infrastructure, and activities.
            {canUpload && <span style={{ color: 'var(--color-primary-600)', marginLeft: 8, fontSize: 'var(--text-xs)' }}>🌐 = Visible on public website</span>}
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Plus size={16} /> Upload Photo
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {items.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)' }}>
            <p style={{ color: 'var(--color-neutral-500)' }}>No photos uploaded yet.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 200, background: 'var(--color-neutral-100)', position: 'relative' }}>
                <img
                  src={item.fileUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const p = e.currentTarget.parentElement;
                    if (p) p.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--color-neutral-400);font-size:12px;padding:16px;text-align:center">Image unavailable</div>';
                  }}
                />
                {/* Public indicator badge */}
                {item.isPublic && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(22, 163, 74, 0.9)', color: 'white', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Globe size={10} /> Public
                  </div>
                )}
              </div>
              <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 'var(--font-bold)' }}>
                  {item.category.replace('_', ' ')}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', flex: 1 }}>{item.title}</h3>
                {item.description && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
                    {item.description}
                  </p>
                )}
                {canUpload && (
                  <button
                    onClick={() => handleTogglePublic(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 'var(--text-xs)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      background: item.isPublic ? 'var(--color-success-50)' : 'transparent',
                      color: item.isPublic ? 'var(--color-success-700)' : 'var(--color-neutral-500)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family-base)',
                      marginTop: 'auto',
                    }}
                  >
                    {item.isPublic ? <><Globe size={10} /> On website</> : <><Lock size={10} /> Private</>}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload to Gallery">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Title" name="title" required placeholder="e.g. Annual Sports Day 2026" />
          <Input label="Description (Optional)" name="description" />

          <Select label="Category" name="category" required>
            <option value="EVENTS">Events</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="ACTIVITIES">Activities</option>
            <option value="SPORTS">Sports</option>
            <option value="ACHIEVEMENTS">Achievements</option>
            <option value="CULTURAL">Cultural</option>
            <option value="EDUCATIONAL">Educational</option>
          </Select>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {fileUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-success-50)', color: 'var(--color-success-700)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                <Check size={16} /> Image uploaded successfully. Ready to save!
              </div>
            ) : (
              <label style={{ cursor: 'pointer', width: '100%' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setIsUploadingFile(true);
                      const { uploadFile } = await import('@/lib/api');
                      const url = await uploadFile(file);
                      setFileUrl(url);
                      toast.success('Image uploaded successfully');
                    } catch {
                      toast.error('Failed to upload image file');
                    } finally {
                      setIsUploadingFile(false);
                    }
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: 'var(--space-6)', border: '2px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', background: 'var(--color-neutral-50)' }}>
                  <Button variant="secondary" type="button" disabled={isUploadingFile} style={{ pointerEvents: 'none' }}>
                    {isUploadingFile ? 'Uploading...' : 'Click to Upload Image (.jpg, .png)'}
                  </Button>
                </div>
              </label>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={isPublicUpload} onChange={e => setIsPublicUpload(e.target.checked)} />
            <Globe size={14} style={{ color: 'var(--color-primary-600)' }} />
            Show on public school website
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setFileUrl(''); }}>Cancel</Button>
            <Button type="submit" variant="primary">Upload</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
