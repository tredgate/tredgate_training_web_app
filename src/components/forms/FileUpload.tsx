import type { JSX } from "react";
import { Upload } from "lucide-react";

export interface FileUploadProps {
  "data-testid": string;
  label: string;
  name: string;
  value: string;
  onChange: (filename: string) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({
  "data-testid": testId,
  label,
  name,
  value,
  onChange,
  accept,
  disabled = false,
  className = "",
}: FileUploadProps): JSX.Element {
  const handleSimulateUpload = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const randomNum = Math.floor(Math.random() * 10000);
    const filename = `upload_${dateStr}_${randomNum}.txt`;
    onChange(filename);
  };

  return (
    <div className={className}>
      <label
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
      </label>
      <div
        data-testid={testId}
        onClick={handleSimulateUpload}
        className={`input-dark border-dashed flex items-center justify-center gap-2 py-6 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Upload className="w-5 h-5 text-gray-500" />
        <span className="text-gray-500">
          {value || "Click to upload a file"}
        </span>
      </div>
    </div>
  );
}
