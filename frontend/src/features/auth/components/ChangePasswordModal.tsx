import { useState } from 'react';
import { Modal, Input, Button, useToast } from '@/components/ui';
import { useAuth } from '@/store/AuthContext';
import { api } from '@/lib/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { logout } = useAuth();
  const toast = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    if (newPassword.length < 8) {
      return setError('New password must be at least 8 characters long');
    }

    try {
      setIsLoading(true);
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      toast.success('Your password was changed successfully. Please log in again.', 'Password changed');
      
      onClose();
      // Force logout so user logs in with new credentials
      setTimeout(() => logout(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', margin: 0 }}>
          Update your account password. You will be logged out after changing.
        </p>
        {error && (
          <div style={{ color: 'var(--color-danger-600)', fontSize: 'var(--text-sm)', background: 'var(--color-danger-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helperText="Must be at least 8 characters"
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            Change Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
