import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Lock, Building2 } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import './Header.css';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const schoolName = user?.role === 'SUPER_ADMIN' 
    ? 'Platform Administration' 
    : user?.school?.name || 'EduVanta';

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="header-school-info">
            <Building2 className="header-school-icon" size={18} />
            <span className="header-school-name">{schoolName}</span>
          </div>
        </div>

        <div className="header-right">
          <div className="header-user" ref={dropdownRef}>
            <button 
              className="header-avatar-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <div className="header-avatar">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="header-dropdown">
                <div className="header-dropdown-header">
                  <p className="header-dropdown-email">{user?.email}</p>
                  <p className="header-dropdown-role">{user?.role.replace('_', ' ')}</p>
                </div>
                <div className="header-dropdown-divider" />
                <button 
                  className="header-dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add profile page navigation later if needed
                  }}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button 
                  className="header-dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                >
                  <Lock size={16} />
                  <span>Change Password</span>
                </button>
                <div className="header-dropdown-divider" />
                <button 
                  className="header-dropdown-item header-dropdown-logout"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/erp/login', { replace: true, state: null });
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}
