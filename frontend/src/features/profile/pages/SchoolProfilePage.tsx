import { useState, useEffect } from 'react';
import { School, MapPin, Phone, Mail, Award, CheckCircle2, Edit2, Plus, Trash2 } from 'lucide-react';
import { Button, Modal, Input, Textarea, useToast } from '@/components/ui';
import { useAuth } from '@/store/AuthContext';
import { profileApi, SchoolProfile } from '../api/profile';
import './SchoolProfilePage.css';

export function SchoolProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const isPrincipal = user?.role === 'PRINCIPAL';

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false);
  const [isAddAchievementOpen, setIsAddAchievementOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileApi.getSchoolProfile();
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load school profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.schoolId) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Handlers
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      principalName: formData.get('principalName') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
      address: formData.get('address') as string,
      description: formData.get('description') as string,
    };

    try {
      await profileApi.updateSchoolProfile(data);
      toast.success('Profile updated successfully');
      setIsEditProfileOpen(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddFacility = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await profileApi.addFacility({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      });
      toast.success('Facility added');
      setIsAddFacilityOpen(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to add facility');
    }
  };

  const handleAddAchievement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await profileApi.addAchievement({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        year: formData.get('year') ? parseInt(formData.get('year') as string, 10) : undefined,
      });
      toast.success('Achievement added');
      setIsAddAchievementOpen(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to add achievement');
    }
  };

  const handleRemoveFacility = async (id: string) => {
    if (!confirm('Are you sure you want to remove this facility?')) return;
    try {
      await profileApi.removeFacility(id);
      toast.success('Facility removed');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to remove facility');
    }
  };

  const handleRemoveAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to remove this achievement?')) return;
    try {
      await profileApi.removeAchievement(id);
      toast.success('Achievement removed');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to remove achievement');
    }
  };

  if (isLoading) return <div className="p-6">Loading profile...</div>;
  if (!profile) return <div className="p-6 text-neutral-500">No school profile available.</div>;

  return (
    <div className="school-profile-page">
      {/* Hero Section */}
      <div className="sp-hero">
        <div className="sp-hero-bg"></div>
        <div className="sp-hero-content">
          <div className="sp-hero-header">
            <div className="sp-logo-container">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt={profile.name} className="sp-logo" />
              ) : (
                <div className="sp-logo-placeholder"><School size={40} /></div>
              )}
            </div>
            <div className="sp-title-group">
              <h1 className="sp-school-name">{profile.name}</h1>
              <p className="sp-principal-name">Principal: {profile.principalName || 'Not specified'}</p>
            </div>
            {isPrincipal && (
              <div className="sp-hero-actions">
                <Button variant="secondary" onClick={() => setIsEditProfileOpen(true)}>
                  <Edit2 size={16} /> Edit Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="sp-grid">
        <div className="sp-main-col">
          <section className="sp-section">
            <h2 className="sp-section-title">About Our School</h2>
            <p className="sp-description">
              {profile.description || 'No description provided yet.'}
            </p>
          </section>

          <section className="sp-section">
            <div className="sp-section-header">
              <h2 className="sp-section-title">Facilities</h2>
              {isPrincipal && (
                <Button variant="ghost" size="sm" onClick={() => setIsAddFacilityOpen(true)}>
                  <Plus size={16} /> Add
                </Button>
              )}
            </div>
            
            <div className="sp-facility-grid">
              {profile.facilities.length === 0 ? (
                <p className="text-neutral-500">No facilities listed.</p>
              ) : (
                profile.facilities.map(facility => (
                  <div key={facility.id} className="sp-facility-card">
                    <div className="sp-facility-icon"><CheckCircle2 size={20} /></div>
                    <div className="sp-facility-info">
                      <h3>{facility.name}</h3>
                      {facility.description && <p>{facility.description}</p>}
                    </div>
                    {isPrincipal && (
                      <button className="sp-delete-btn" onClick={() => handleRemoveFacility(facility.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="sp-side-col">
          <section className="sp-section sp-card">
            <h2 className="sp-section-title">Contact Information</h2>
            <ul className="sp-contact-list">
              <li>
                <MapPin size={18} className="text-primary-600" />
                <span>{profile.address || 'Address not provided'}</span>
              </li>
              <li>
                <Phone size={18} className="text-primary-600" />
                <span>{profile.contactPhone || 'Phone not provided'}</span>
              </li>
              <li>
                <Mail size={18} className="text-primary-600" />
                <span>{profile.contactEmail || 'Email not provided'}</span>
              </li>
            </ul>
          </section>

          <section className="sp-section sp-card">
            <div className="sp-section-header">
              <h2 className="sp-section-title">Achievements</h2>
              {isPrincipal && (
                <Button variant="ghost" size="sm" onClick={() => setIsAddAchievementOpen(true)}>
                  <Plus size={16} /> Add
                </Button>
              )}
            </div>
            <ul className="sp-achievement-list">
              {profile.achievements.length === 0 ? (
                <p className="text-neutral-500 text-sm">No achievements listed.</p>
              ) : (
                profile.achievements.map(ach => (
                  <li key={ach.id} className="sp-achievement-item">
                    <div className="sp-achievement-icon"><Award size={20} /></div>
                    <div className="sp-achievement-info">
                      <h4>{ach.title} {ach.year && <span className="sp-year-badge">{ach.year}</span>}</h4>
                      {ach.description && <p>{ach.description}</p>}
                    </div>
                    {isPrincipal && (
                      <button className="sp-delete-btn" onClick={() => handleRemoveAchievement(ach.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </section>
          
          <section className="sp-section sp-card sp-stats-card">
            <div className="sp-stat">
              <span className="sp-stat-value">{profile._count.students}</span>
              <span className="sp-stat-label">Students</span>
            </div>
            <div className="sp-stat">
              <span className="sp-stat-value">{profile._count.teachers}</span>
              <span className="sp-stat-label">Teachers</span>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {isPrincipal && (
        <>
          <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit School Profile">
            <form onSubmit={handleUpdateProfile} className="sp-form">
              <Input label="School Name" name="name" defaultValue={profile.name} required />
              <Input label="Principal Name" name="principalName" defaultValue={profile.principalName || ''} />
              <Input label="Contact Email" name="contactEmail" type="email" defaultValue={profile.contactEmail || ''} />
              <Input label="Contact Phone" name="contactPhone" defaultValue={profile.contactPhone || ''} />
              <Textarea label="Address" name="address" defaultValue={profile.address || ''} rows={2} />
              <Textarea label="Description" name="description" defaultValue={profile.description || ''} rows={4} />
              <div className="sp-form-actions">
                <Button type="button" variant="ghost" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </Modal>

          <Modal isOpen={isAddFacilityOpen} onClose={() => setIsAddFacilityOpen(false)} title="Add Facility">
            <form onSubmit={handleAddFacility} className="sp-form">
              <Input label="Facility Name" name="name" placeholder="e.g. Computer Lab" required />
              <Textarea label="Description (Optional)" name="description" rows={3} />
              <div className="sp-form-actions">
                <Button type="button" variant="ghost" onClick={() => setIsAddFacilityOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Facility</Button>
              </div>
            </form>
          </Modal>

          <Modal isOpen={isAddAchievementOpen} onClose={() => setIsAddAchievementOpen(false)} title="Add Achievement">
            <form onSubmit={handleAddAchievement} className="sp-form">
              <Input label="Achievement Title" name="title" placeholder="e.g. Best District School" required />
              <Input label="Year (Optional)" name="year" type="number" min="1900" max="2100" />
              <Textarea label="Description (Optional)" name="description" rows={3} />
              <div className="sp-form-actions">
                <Button type="button" variant="ghost" onClick={() => setIsAddAchievementOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Achievement</Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
