import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, placeholder, required, id, children, className = '', ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`select-field ${className}`}>
        {label && (
          <label className="select-label" htmlFor={selectId}>
            {label}
            {required && <span className="select-required" aria-hidden="true"> *</span>}
          </label>
        )}
        <div className={`select-wrapper ${error ? 'select-wrapper-error' : ''}`}>
          <select
            id={selectId}
            ref={ref}
            className="select"
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            required={required}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {children}
          </select>
          <span className="select-chevron" aria-hidden="true">
            <ChevronDown size={16} />
          </span>
        </div>
        {error && <p id={`${selectId}-error`} className="select-error" role="alert">{error}</p>}
        {!error && helperText && <p className="select-helper">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
