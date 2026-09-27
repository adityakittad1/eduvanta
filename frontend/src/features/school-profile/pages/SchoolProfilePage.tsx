import { useState, useEffect } from 'react';
import { Building, Save } from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { schoolProfileApi, SchoolProfile } from '../api/school-profile';
import { useAuth } from '@/store/AuthContext';

export function SchoolProfilePage() {
  const toast = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'PRINCIPAL';

  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await schoolProfileApi.getProfile();
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit) return;
    const formData = new FormData(e.currentTarget);
    try {
      await schoolProfileApi.updateProfile({
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        contactPhone: formData.get('contactPhone') as string,
        contactEmail: formData.get('contactEmail') as string,
        principalName: formData.get('principalName') as string,
        description: formData.get('description') as string,
      });
      toast.success('School profile updated successfully!');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (isLoading || !profile) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-md)' }}>
          <Building size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            School Profile
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: '4px' }}>
            Manage the general information about the school.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} style={{ background: 'var(--color-neutral-0)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Input label="School Name" name="name" defaultValue={profile.name} required disabled={!canEdit} />
        <Input label="Principal Name" name="principalName" defaultValue={profile.principalName || ''} disabled={!canEdit} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input label="Contact Phone" name="contactPhone" defaultValue={profile.contactPhone || ''} disabled={!canEdit} />
          <Input label="Contact Email" name="contactEmail" type="email" defaultValue={profile.contactEmail || ''} disabled={!canEdit} />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-1)' }}>
            Address
          </label>
          <textarea 
            name="address" 
            defaultValue={profile.address || ''} 
            disabled={!canEdit}
            style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', minHeight: 80 }}
          ></textarea>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-1)' }}>
            Description / Bio
          </label>
          <textarea 
            name="description" 
            defaultValue={profile.description || ''} 
            disabled={!canEdit}
            style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', minHeight: 120 }}
          ></textarea>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <Button type="submit" variant="primary">
              <Save size={16} /> Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
