import { useState, useEffect } from 'react';
import { TcTemplate, tcTemplateApi } from '../api/tc-template';
import { Button, useToast, Badge } from '@/components/ui';
import { FileUp, CheckCircle, Download, Clock } from 'lucide-react';
import { uploadFile } from '@/lib/api';

export function TcTemplateManager() {
  const toast = useToast();
  const [templates, setTemplates] = useState<TcTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await tcTemplateApi.getTemplates();
      setTemplates(data);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      toast.error('Only .docx files are supported');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadFile(file);
      const newTpl = await tcTemplateApi.uploadTemplate(`Template v${templates.length + 1}`, url);
      setTemplates([newTpl, ...templates]);
      toast.success('Template uploaded successfully');
    } catch {
      toast.error('Failed to upload template');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await tcTemplateApi.activateTemplate(id);
      toast.success('Template activated');
      fetchTemplates();
    } catch {
      toast.error('Failed to activate template');
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading templates...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ background: 'var(--color-primary-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-100)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'var(--font-bold)', color: 'var(--color-primary-900)', marginBottom: 'var(--space-2)' }}>
          TC Template Configuration
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', marginBottom: 'var(--space-4)' }}>
          Upload a <strong>.docx</strong> template with the following placeholders to automatically generate TCs:
          <br /><br />
          <code>{`{{student_name}}, {{admission_number}}, {{date_of_birth}}, {{date_of_admission}}, {{date_of_leaving}}, {{class}}, {{section}}, {{reason_for_leaving}}, {{school_name}}, {{school_address}}, {{principal_name}}`}</code>
        </p>
        
        <div>
          <input 
            type="file" 
            id="template-upload" 
            accept=".docx" 
            style={{ display: 'none' }} 
            onChange={handleUpload}
            disabled={isUploading}
          />
          <label htmlFor="template-upload">
            <Button type="button" variant="primary" disabled={isUploading} style={{ pointerEvents: 'none' }}>
              <FileUp size={16} /> {isUploading ? 'Uploading...' : 'Upload New Template (.docx)'}
            </Button>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {templates.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-neutral-500)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)' }}>
            No templates uploaded yet.
          </div>
        ) : (
          templates.map(tpl => (
            <div key={tpl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: `1px solid ${tpl.status === 'ACTIVE' ? 'var(--color-success-300)' : 'var(--color-neutral-200)'}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                  <h4 style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>{tpl.name}</h4>
                  <Badge variant={tpl.status === 'ACTIVE' ? 'success' : 'warning'}>{tpl.status}</Badge>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', display: 'flex', gap: 'var(--space-4)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Uploaded: {new Date(tpl.createdAt).toLocaleDateString()}</span>
                  <span>Version: {tpl.version}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <a href={tpl.fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="ghost">
                    <Download size={16} /> Download
                  </Button>
                </a>
                {tpl.status !== 'ACTIVE' && (
                  <Button size="sm" variant="secondary" onClick={() => handleActivate(tpl.id)}>
                    <CheckCircle size={16} /> Activate
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
