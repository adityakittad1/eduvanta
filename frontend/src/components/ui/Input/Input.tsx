import React, { InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, required, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`input-field ${className}`}>
        {label && (
          <label className="input-label" htmlFor={inputId}>
            {label}
            {required && <span className="input-required" aria-hidden="true"> *</span>}
          </label>
        )}
        <div className={`input-wrapper ${error ? 'input-wrapper-error' : ''}`}>
          {leftIcon && <span className="input-icon input-icon-left" aria-hidden="true">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            className={`input ${leftIcon ? 'input-has-left-icon' : ''} ${rightIcon ? 'input-has-right-icon' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            required={required}
            {...props}
          />
          {rightIcon && <span className="input-icon input-icon-right" aria-hidden="true">{rightIcon}</span>}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="input-error" role="alert">{error}</p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="input-helper">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
