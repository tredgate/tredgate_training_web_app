import type { JSX } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  "data-testid": string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Select({
  "data-testid": testId,
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = "",
}: SelectProps): JSX.Element {
  return (
    <div className={className}>
      <label
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        data-testid={testId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-dark ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30" : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          data-testid={`${testId}-error`}
          className="text-red-400 text-sm mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}
