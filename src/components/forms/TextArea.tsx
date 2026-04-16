import type { JSX } from 'react';

export interface TextAreaProps {
  "data-testid": string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string | null;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function TextArea({
  "data-testid": testId,
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  className = "",
}: TextAreaProps): JSX.Element {
  return (
    <div className={className}>
      <label
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        data-testid={testId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`input-dark resize-none ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30" : ""}`}
      />
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
