import { TextareaHTMLAttributes, forwardRef } from 'react';
import './Input.css'; // We can share the input styles for consistency

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, id, className = '', ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`input-field ${className}`}>
        {label && (
          <label className="input-label" htmlFor={textareaId}>
            {label}
            {required && <span className="input-required" aria-hidden="true"> *</span>}
          </label>
        )}
        <div className={`input-wrapper ${error ? 'input-wrapper-error' : ''}`}>
          <textarea
            id={textareaId}
            ref={ref}
            className="input"
            aria-invalid={!!error}
            aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
            style={{ resize: 'vertical', minHeight: '80px' }}
            {...props}
          />
        </div>
        {error && (
          <p id={`${textareaId}-error`} className="input-error" role="alert">{error}</p>
        )}
        {!error && helperText && (
          <p id={`${textareaId}-helper`} className="input-helper">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
