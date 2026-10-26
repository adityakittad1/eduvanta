import React, { useState } from 'react';

import { Mail, Lock, School } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { Button, Input } from '@/components/ui';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation is now handled safely by PublicRoute based on the user's role
    } catch (err: unknown) {
      // The API interceptor now throws a standard Error with the backend message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr?.response?.data?.message ?? 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-brand" aria-hidden="true">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <School size={40} />
          </div>
          <h1 className="login-brand-title">ZP School ERP</h1>
          <p className="login-brand-subtitle">
            Data-Driven Student Monitoring and Academic Assistance System
          </p>
          <div className="login-brand-features">
            {[
              'Multi-school management',
              'Digital attendance tracking',
              'Academic performance analytics',
              'Early Warning System',
              'AI-powered school assistant',
            ].map((f) => (
              <div key={f} className="login-brand-feature">
                <div className="login-brand-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <p className="login-brand-footer">
            Deployed across 6 Zilla Parishad Schools<br />
            Maharashtra, India
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <div className="login-form-logo">
              <School size={28} />
            </div>
            <h2 className="login-form-title">Sign in</h2>
            <p className="login-form-subtitle">
              Enter your credentials to access the ERP portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <Input
              id="login-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.in"
              leftIcon={<Mail size={16} />}
              autoComplete="email"
              autoFocus
              required
            />

            <Input
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              leftIcon={<Lock size={16} />}
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              id="login-submit"
            >
              Sign In
            </Button>
          </form>

          <div className="login-demo-creds">
            <p className="login-demo-title">Demo credentials</p>
            <div className="login-demo-grid">
              {[
                { role: 'SUPER_ADMIN', email: 'admin@zperp.in',            pass: 'Admin@123456' },
                { role: 'PRINCIPAL',   email: 'principal@zpschool1.in',    pass: 'Principal@123' },
                { role: 'TEACHER',     email: 'teacher@zpschool1.in',      pass: 'Teacher@123' },
                { role: 'STUDENT',     email: 'student@zpschool1.in',      pass: 'Student@123' },
              ].map(({ role, email: e, pass }) => (
                <button
                  key={role}
                  type="button"
                  className="login-demo-btn"
                  onClick={() => { setEmail(e); setPassword(pass); setError(''); }}
                >
                  <span className="login-demo-role">{role}</span>
                  <span className="login-demo-email">{e}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="login-footer">
            Zilla Parishad School ERP &mdash; Academic Project 2025–26
          </p>
        </div>
      </div>
    </div>
  );
}
