import { useState, useRef, useEffect } from "react";
import type { JSX } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  "data-testid": string;
  label: string;
  name: string;
  value: string[];
  onChange: (selectedValues: string[]) => void;
  options: SelectOption[];
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function MultiSelect({
  "data-testid": testId,
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder = "Select options...",
  required = false,
  disabled = false,
  className = "",
}: MultiSelectProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedCount = value.length;
  const displayText =
    selectedCount > 0 ? `${selectedCount} selected` : placeholder;

  return (
    <div className={className}>
      <label
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative" ref={containerRef}>
        <button
          data-testid={testId}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`input-dark flex justify-between items-center text-left ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={selectedCount > 0 ? "text-gray-100" : "text-gray-500"}
          >
            {displayText}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            data-testid={`${testId}-dropdown`}
            className="absolute z-50 mt-1 w-full glass bg-gray-900/80 p-2 max-h-48 overflow-y-auto border border-white/10"
          >
            {options.map((opt) => (
              <label
                key={opt.value}
                data-testid={`${testId}-option-${opt.value}`}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => handleToggleOption(opt.value)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/30"
                />
                <span className="text-sm text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

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
