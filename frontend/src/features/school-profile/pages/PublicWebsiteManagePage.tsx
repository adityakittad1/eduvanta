import { useState, useEffect } from 'react';
import {
  Globe, Settings, Image as ImageIcon, Award, BookOpen, Calendar,
  Plus, Trash2, ExternalLink, Eye, Save, CheckCircle,
} from 'lucide-react';
import { Button, Input, Modal, useToast } from '@/components/ui';
import { schoolProfileApi } from '../api/school-profile';
import type { SchoolProfile, SchoolFacility, SchoolAchievement, SchoolEvent } from '../api/school-profile';
import { getTenantUrl } from '@/utils/tenant';

// Tabs
type Tab = 'profile' | 'facilities' | 'achievements' | 'events';

export function PublicWebsiteManagePage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<SchoolProfile>>({});

  // Facilities
  const [facilities, setFacilities] = useState<SchoolFacility[]>([]);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: '', description: '' });

  // Achievements
  const [achievements, setAchievements] = useState<SchoolAchievement[]>([]);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', year: '' });

  // Events
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', isPublic: true });

  // ─── Load data ───────────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setIsProfileLoading(true);
      const p = await schoolProfileApi.getProfile();
      setProfile(p);
      setProfileForm({
        name: p.name,
        description: p.description || '',
        tagline: p.tagline || '',
        address: p.address || '',
        contactPhone: p.contactPhone || '',
        contactEmail: p.contactEmail || '',
        principalName: p.principalName || '',
        logoUrl: p.logoUrl || '',
        establishedYear: p.establishedYear,
        isPublicEnabled: p.isPublicEnabled,
      });
      setFacilities(p.facilities || []);
      setAchievements(p.achievements || []);
      setEvents(p.events || []);
    } catch {
      toast.error('Failed to load school profile');
    } finally {
      setIsProfileLoading(false);
    }
  }

  // ─── Save Profile ────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await schoolProfileApi.updateProfile(profileForm);
      setProfile(updated);
      toast.success('School profile updated!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Facilities ──────────────────────────────────────────────
  async function handleAddFacility(e: React.FormEvent) {
    e.preventDefault();
    try {
      const fac = await schoolProfileApi.createFacility(newFacility);
      setFacilities(prev => [...prev, fac]);
      setNewFacility({ name: '', description: '' });
      setIsFacilityModalOpen(false);
      toast.success('Facility added');
    } catch {
      toast.error('Failed to add facility');
    }
  }

  async function handleDeleteFacility(id: string) {
    if (!window.confirm('Remove this facility?')) return;
    try {
      await schoolProfileApi.deleteFacility(id);
      setFacilities(prev => prev.filter(f => f.id !== id));
      toast.success('Facility removed');
    } catch {
      toast.error('Failed to remove facility');
    }
  }

  // ─── Achievements ────────────────────────────────────────────
  async function handleAddAchievement(e: React.FormEvent) {
    e.preventDefault();
    try {
      const ach = await schoolProfileApi.createAchievement({
        ...newAchievement,
        year: newAchievement.year ? Number(newAchievement.year) : undefined,
      });
      setAchievements(prev => [...prev, ach]);
      setNewAchievement({ title: '', description: '', year: '' });
      setIsAchievementModalOpen(false);
      toast.success('Achievement added');
    } catch {
      toast.error('Failed to add achievement');
    }
  }

  async function handleDeleteAchievement(id: string) {
    if (!window.confirm('Remove this achievement?')) return;
    try {
      await schoolProfileApi.deleteAchievement(id);
      setAchievements(prev => prev.filter(a => a.id !== id));
      toast.success('Achievement removed');
    } catch {
      toast.error('Failed to remove achievement');
    }
  }

  // ─── Events ──────────────────────────────────────────────────
  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const ev = await schoolProfileApi.createEvent(newEvent);
      setEvents(prev => [...prev, ev]);
      setNewEvent({ title: '', description: '', eventDate: '', isPublic: true });
      setIsEventModalOpen(false);
      toast.success('Event added');
    } catch {
      toast.error('Failed to add event');
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!window.confirm('Remove this event?')) return;
    try {
      await schoolProfileApi.deleteEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      toast.success('Event removed');
    } catch {
      toast.error('Failed to remove event');
    }
  }

  if (isProfileLoading) {
    return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'School Profile', icon: <Settings size={16} /> },
    { id: 'facilities', label: 'Facilities', icon: <BookOpen size={16} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={16} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
  ];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-md)' }}>
            <Globe size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
              Public Website
            </h1>
            <p style={{ color: 'var(--color-neutral-500)', marginTop: 2, fontSize: 'var(--text-sm)' }}>
              Manage your school's public-facing website content
            </p>
          </div>
        </div>

        {profile?.slug && (
          <a
            href={`/school/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="secondary" size="sm">
              <Eye size={14} /> Preview Website <ExternalLink size={12} />
            </Button>
          </a>
        )}
      </div>

      {/* Status banner */}
      <div style={{
        padding: 'var(--space-4)',
        background: profile?.isPublicEnabled ? 'var(--color-success-50)' : 'var(--color-warning-50)',
        border: `1px solid ${profile?.isPublicEnabled ? 'var(--color-success-100)' : 'var(--color-warning-100)'}`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
        fontSize: 'var(--text-sm)',
      }}>
        <CheckCircle size={18} style={{ color: profile?.isPublicEnabled ? 'var(--color-success-600)' : 'var(--color-warning-600)', flexShrink: 0 }} />
        <div>
          {profile?.isPublicEnabled ? (
            <>Your public website is <strong>live</strong>. Visitors can see it at{' '}
              {profile.slug ? (
                <a href={getTenantUrl(profile.slug)} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-600)' }}>
                  {typeof window !== 'undefined' && getTenantUrl(profile.slug).startsWith('/')
                    ? `${window.location.origin}${getTenantUrl(profile.slug)}`
                    : getTenantUrl(profile.slug)}
                </a>
              ) : 'your school URL'}.
            </>
          ) : (
            'Your public website is currently <strong>disabled</strong>. Enable it in the Profile tab.'
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--color-neutral-200)', marginBottom: 'var(--space-6)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
              fontWeight: activeTab === tab.id ? 'var(--font-semibold)' : 'var(--font-regular)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              marginBottom: -1,
              transition: 'all 150ms ease',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Profile Tab ────────────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ background: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-5)', color: 'var(--color-neutral-800)' }}>
              Basic Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input
                label="School Name"
                value={profileForm.name || ''}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                required
              />
              <Input
                label="Tagline (optional)"
                placeholder="e.g. Nurturing Minds Since 1985"
                value={profileForm.tagline || ''}
                onChange={e => setProfileForm(p => ({ ...p, tagline: e.target.value }))}
              />
              <Input
                label="Established Year"
                type="number"
                placeholder="e.g. 1985"
                value={profileForm.establishedYear?.toString() || ''}
                onChange={e => setProfileForm(p => ({ ...p, establishedYear: e.target.value ? Number(e.target.value) : undefined }))}
              />
              <Input
                label="Principal Name"
                value={profileForm.principalName || ''}
                onChange={e => setProfileForm(p => ({ ...p, principalName: e.target.value }))}
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-1)' }}>
                  School Description
                </label>
                <textarea
                  value={profileForm.description || ''}
                  onChange={e => setProfileForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="A brief description of your school for the public website..."
                  style={{ width: '100%', minHeight: 100, padding: '8px 12px', border: '1px solid var(--color-neutral-300)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-base)', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-5)', color: 'var(--color-neutral-800)' }}>
              Contact &amp; Branding
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input
                label="Address"
                value={profileForm.address || ''}
                onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                placeholder="School address"
              />
              <Input
                label="Contact Phone"
                value={profileForm.contactPhone || ''}
                onChange={e => setProfileForm(p => ({ ...p, contactPhone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
              />
              <Input
                label="Contact Email"
                type="email"
                value={profileForm.contactEmail || ''}
                onChange={e => setProfileForm(p => ({ ...p, contactEmail: e.target.value }))}
                placeholder="school@example.com"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-700)' }}>School Logo</label>
                {profileForm.logoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-success-50)', color: 'var(--color-success-700)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                    <CheckCircle size={16} /> Logo uploaded! 
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <label style={{ cursor: 'pointer', width: '100%' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const { uploadFile } = await import('@/lib/api');
                            const url = await uploadFile(file);
                            setProfileForm(p => ({ ...p, logoUrl: url }));
                            toast.success('Logo uploaded');
                          } catch {
                            toast.error('Failed to upload logo');
                          }
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: 'var(--space-3)', border: '2px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-md)', background: 'var(--color-neutral-50)' }}>
                        <Button variant="secondary" type="button" style={{ pointerEvents: 'none' }}>
                          <ImageIcon size={14} style={{ marginRight: 6 }} /> Click to Upload Logo
                        </Button>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-neutral-800)' }}>
              Website Visibility
            </h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={profileForm.isPublicEnabled ?? true}
                onChange={e => setProfileForm(p => ({ ...p, isPublicEnabled: e.target.checked }))}
                style={{ width: 18, height: 18 }}
              />
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>
                  Enable Public Website
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                  When enabled, your school will have a publicly accessible website.
                </div>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      )}

      {/* ─── Facilities Tab ──────────────────────────────── */}
      {activeTab === 'facilities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>School Facilities</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>Showcase the facilities available at your school.</p>
            </div>
            <Button variant="primary" onClick={() => setIsFacilityModalOpen(true)}>
              <Plus size={16} /> Add Facility
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {facilities.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', border: '1px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', color: 'var(--color-neutral-500)' }}>
                No facilities added yet. Click "Add Facility" to get started.
              </div>
            ) : (
              facilities.map(f => (
                <div key={f.id} style={{ background: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{f.name}</div>
                    {f.description && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>{f.description}</div>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteFacility(f.id)}>
                    <Trash2 size={14} style={{ color: 'var(--color-danger-600)' }} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── Achievements Tab ────────────────────────────── */}
      {activeTab === 'achievements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>School Achievements</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>Highlight your school's milestones and awards.</p>
            </div>
            <Button variant="primary" onClick={() => setIsAchievementModalOpen(true)}>
              <Plus size={16} /> Add Achievement
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {achievements.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', border: '1px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', color: 'var(--color-neutral-500)' }}>
                No achievements added yet.
              </div>
            ) : (
              achievements.map(a => (
                <div key={a.id} style={{ background: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{a.title} {a.year && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', marginLeft: 8 }}>({a.year})</span>}</div>
                    {a.description && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>{a.description}</div>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAchievement(a.id)}>
                    <Trash2 size={14} style={{ color: 'var(--color-danger-600)' }} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── Events Tab ──────────────────────────────────── */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>School Events</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>Publish events to your public website calendar.</p>
            </div>
            <Button variant="primary" onClick={() => setIsEventModalOpen(true)}>
              <Plus size={16} /> Add Event
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {events.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', border: '1px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', color: 'var(--color-neutral-500)' }}>
                No events added yet.
              </div>
            ) : (
              events.map(ev => (
                <div key={ev.id} style={{ background: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>
                      {ev.title}
                      {ev.isPublic && <span style={{ marginLeft: 8, fontSize: 'var(--text-xs)', background: 'var(--color-success-50)', color: 'var(--color-success-700)', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-medium)' }}>Public</span>}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>
                      {new Date(ev.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </div>
                    {ev.description && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>{ev.description}</div>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(ev.id)}>
                    <Trash2 size={14} style={{ color: 'var(--color-danger-600)' }} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── Modals ──────────────────────────────────────── */}

      {/* Add Facility */}
      <Modal isOpen={isFacilityModalOpen} onClose={() => setIsFacilityModalOpen(false)} title="Add Facility">
        <form onSubmit={handleAddFacility} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Facility Name" required placeholder="e.g. Computer Lab" value={newFacility.name} onChange={e => setNewFacility(p => ({ ...p, name: e.target.value }))} />
          <Input label="Description (optional)" placeholder="e.g. 30 computers with internet" value={newFacility.description} onChange={e => setNewFacility(p => ({ ...p, description: e.target.value }))} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsFacilityModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Facility</Button>
          </div>
        </form>
      </Modal>

      {/* Add Achievement */}
      <Modal isOpen={isAchievementModalOpen} onClose={() => setIsAchievementModalOpen(false)} title="Add Achievement">
        <form onSubmit={handleAddAchievement} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Achievement Title" required placeholder="e.g. District Level Sports Champion" value={newAchievement.title} onChange={e => setNewAchievement(p => ({ ...p, title: e.target.value }))} />
          <Input label="Year" type="number" placeholder="e.g. 2024" value={newAchievement.year} onChange={e => setNewAchievement(p => ({ ...p, year: e.target.value }))} />
          <Input label="Description (optional)" placeholder="Additional details" value={newAchievement.description} onChange={e => setNewAchievement(p => ({ ...p, description: e.target.value }))} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsAchievementModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Achievement</Button>
          </div>
        </form>
      </Modal>

      {/* Add Event */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Add Event">
        <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Event Title" required placeholder="e.g. Annual Sports Day" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
          <Input label="Event Date" type="date" required value={newEvent.eventDate} onChange={e => setNewEvent(p => ({ ...p, eventDate: e.target.value }))} />
          <Input label="Description (optional)" placeholder="Event details" value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={newEvent.isPublic} onChange={e => setNewEvent(p => ({ ...p, isPublic: e.target.checked }))} />
            Show on public website
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
