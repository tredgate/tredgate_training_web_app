import type { JSX } from 'react';

export interface TextInputProps {
  "data-testid": string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  placeholder?: string;
  type?: "text" | "email" | "password";
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function TextInput({
  "data-testid": testId,
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className = "",
}: TextInputProps): JSX.Element {
  return (
    <div className={className}>
      <label
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        data-testid={testId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-dark ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30" : ""}`}
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
