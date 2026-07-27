import { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, accept = '.csv', disabled }: FileUploadProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = '';
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith('.csv')) onFileSelect(file);
    },
    [onFileSelect, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-8 py-12
        transition-colors
        ${disabled ? 'cursor-not-allowed border-gray-300 bg-gray-50' : 'cursor-pointer border-blue-400 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-50'}
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <svg
        className="mb-4 h-12 w-12 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="mb-1 text-sm font-medium text-gray-700">
        Click to upload or drag and drop
      </p>
      <p className="text-xs text-gray-500">Clockify time report (CSV)</p>
    </div>
  );
}
