import type { JSX } from "react";

export interface CheckboxProps {
  "data-testid": string;
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  "data-testid": testId,
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = "",
}: CheckboxProps): JSX.Element {
  return (
    <label
      data-testid={testId}
      className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/30"
      />
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}
