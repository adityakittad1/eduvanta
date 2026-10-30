import { useState, useEffect } from 'react';
import { Plus, Edit2, ExternalLink } from 'lucide-react';
import { Button, DataTable, Badge, Modal, Input, Textarea, useToast } from '@/components/ui';
import { School, schoolsApi } from '../api/schools';
import { getTenantUrl } from '@/utils/tenant';

export function ManageSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const toast = useToast();

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const res = await schoolsApi.getAll({ limit: 50 });
      setSchools(res.data);
    } catch (error) {
      toast.error('Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contactEmail = (formData.get('contactEmail') as string)?.trim();
    const data = {
      name: (formData.get('name') as string)?.trim(),
      principalName: (formData.get('principalName') as string)?.trim() || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: (formData.get('contactPhone') as string)?.trim() || undefined,
      address: (formData.get('address') as string)?.trim() || undefined,
    };

    try {
      if (editingSchool) {
        await schoolsApi.update(editingSchool.id, data);
        toast.success('School updated successfully');
      } else {
        await schoolsApi.create(data);
        toast.success('School created successfully');
      }
      setIsModalOpen(false);
      fetchSchools();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save school';
      toast.error(errorMsg);
    }
  };

  const openEditModal = (school: School) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Name', accessorKey: 'name' as keyof School },
    { header: 'Principal', cell: (s: School) => s.principalName || '-' },
    { header: 'Students', cell: (s: School) => s._count?.students || 0 },
    { header: 'Teachers', cell: (s: School) => s._count?.teachers || 0 },
    {
      header: 'Status',
      cell: (s: School) => (
        <Badge variant={s.isActive ? 'success' : 'danger'}>
          {s.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'URL',
      cell: (s: School) => (
        <a href={getTenantUrl(s.slug)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', textDecoration: 'none' }}>
          Open School <ExternalLink size={14} />
        </a>
      )
    },
    {
      header: 'Actions',
      cell: (s: School) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(s)}>
            <Edit2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Manage Schools</h1>
          <p className="page-subtitle">Onboard and manage Zilla Parishad schools.</p>
        </div>
        <Button onClick={() => { setEditingSchool(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Add School
        </Button>
      </div>

      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: 'var(--space-4)' }}>Loading...</p> : <DataTable columns={columns} data={schools} keyExtractor={(s) => s.id} emptyMessage="No schools found." />}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchool ? 'Edit School' : 'Add New School'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="School Name" name="name" defaultValue={editingSchool?.name} required />
          <Input label="Principal Name" name="principalName" defaultValue={editingSchool?.principalName || ''} />
          <Input label="Contact Email" name="contactEmail" type="email" defaultValue={editingSchool?.contactEmail || ''} />
          <Input label="Contact Phone" name="contactPhone" defaultValue={editingSchool?.contactPhone || ''} />
          <Textarea label="Address" name="address" defaultValue={editingSchool?.address || ''} rows={3} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingSchool ? 'Save Changes' : 'Create School'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
