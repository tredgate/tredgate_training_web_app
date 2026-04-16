import type { JSX } from "react";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  "data-testid": string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: RadioOption[];
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function RadioGroup({
  "data-testid": testId,
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  className = "",
}: RadioGroupProps): JSX.Element {
  return (
    <fieldset
      data-testid={testId}
      className={`${disabled ? "opacity-50" : ""} ${className}`}
      disabled={disabled}
    >
      <legend className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </legend>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            data-testid={`${testId}-option-${opt.value}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              disabled={disabled}
              className="w-4 h-4 border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/30"
            />
            <span className="text-sm text-gray-300">{opt.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p
          data-testid={`${testId}-error`}
          className="text-red-400 text-sm mt-1"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
