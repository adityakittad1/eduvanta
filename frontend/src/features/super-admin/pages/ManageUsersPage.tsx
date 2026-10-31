import { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { Button, DataTable, Badge, Modal, Input, Select, useToast } from '@/components/ui';
import { User, usersApi } from '../api/users';
import { School, schoolsApi } from '../api/schools';

export function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'PRINCIPAL' | 'SUPER_ADMIN'>('PRINCIPAL');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const toast = useToast();

  const fetchUsersAndSchools = async () => {
    try {
      setIsLoading(true);
      const roleParam = filterRole === 'ALL' ? undefined : (filterRole as any);
      const [usersRes, schoolsRes] = await Promise.all([
        usersApi.getAll({ 
          limit: 100, 
          role: roleParam,
          search: searchQuery.trim() || undefined 
        }),
        schoolsApi.getAll({ limit: 50 }),
      ]);
      setUsers(usersRes.data);
      setSchools(schoolsRes.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsersAndSchools();
    }, 200);
    return () => clearTimeout(timer);
  }, [filterRole, searchQuery]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as any,
      schoolId: formData.get('schoolId') as string,
    };
    
    if (data.role === 'PRINCIPAL' && !data.schoolId) {
      return toast.error('School is required for Principals.');
    }
    
    // Clear schoolId if SUPER_ADMIN
    if (data.role === 'SUPER_ADMIN') {
      data.schoolId = '';
    }
    
    const password = formData.get('password') as string;

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, password ? { ...data, password } : data);
        toast.success('User updated successfully');
      } else {
        if (!password) {
          return toast.error('Password is required for new users');
        }
        await usersApi.create({ ...data, password });
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsersAndSchools();
    } catch (error: any) {
      const resData = error.response?.data;
      if (resData?.code === 'VALIDATION_ERROR' && resData.errors) {
        const firstErrorKey = Object.keys(resData.errors)[0];
        const firstErrorMessage = resData.errors[firstErrorKey][0];
        toast.error(firstErrorMessage || 'Validation failed');
      } else {
        toast.error(resData?.message || 'Failed to save user');
      }
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role as 'PRINCIPAL' | 'SUPER_ADMIN');
    setIsModalOpen(true);
  };

  const columns = [
    { 
      header: 'Name', 
      cell: (u: User) => (
        <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>
          {u.name || (u.role === 'SUPER_ADMIN' ? 'System Administrator' : 'Principal')}
        </span>
      )
    },
    { header: 'Email', accessorKey: 'email' as keyof User },
    { 
      header: 'Role', 
      cell: (u: User) => (
        <Badge variant={u.role === 'SUPER_ADMIN' ? 'danger' : u.role === 'PRINCIPAL' ? 'warning' : 'success'}>
          {u.role.replace('_', ' ')}
        </Badge>
      ) 
    },
    { header: 'School', cell: (u: User) => u.school?.name || 'Platform Level' },
    {
      header: 'Status',
      cell: (u: User) => (
        <Badge variant={u.isActive ? 'success' : 'neutral'}>
          {u.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (u: User) => (
        <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}>
          <Edit2 size={16} />
        </Button>
      ),
    },
  ];

  const roleTabs = [
    { label: 'All Users', value: 'ALL' },
    { label: 'Principals', value: 'PRINCIPAL' },
    { label: 'Super Admins', value: 'SUPER_ADMIN' },
    { label: 'Teachers', value: 'TEACHER' },
    { label: 'Students', value: 'STUDENT' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">Provision Principals and Platform Admins.</p>
        </div>
        <Button onClick={() => { 
          setEditingUser(null); 
          setSelectedRole('PRINCIPAL');
          setIsModalOpen(true); 
        }}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {roleTabs.map(tab => (
            <Button
              key={tab.value}
              variant={filterRole === tab.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterRole(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div style={{ position: 'relative', width: 280 }}>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        {isLoading ? (
          <p style={{ padding: 'var(--space-4)', textAlign: 'center' }}>Loading users...</p>
        ) : (
          <DataTable columns={columns} data={users} keyExtractor={(u) => u.id} emptyMessage="No users found." />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Full Name" name="name" defaultValue={(editingUser as any)?.name} required />
          <Input label="Email Address" name="email" type="email" defaultValue={editingUser?.email} required />
          <Input 
            label={editingUser ? "New Password (leave blank to keep current)" : "Password"} 
            name="password" 
            type="password" 
            required={!editingUser} 
          />
          
          <Select 
            label="Role" 
            name="role" 
            value={selectedRole}
            onChange={(e: any) => setSelectedRole(e.target.value)}
            required 
          >
            <option value="PRINCIPAL">Principal</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>

          {selectedRole === 'PRINCIPAL' && (
            <Select 
              label="Assign to School" 
              name="schoolId" 
              defaultValue={editingUser?.schoolId || ''}
              required
            >
              <option value="">-- Select a School --</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingUser ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
