import { useState } from "react";

interface EditableFieldProps {
  value: string | null;
  onSave: (val: string) => void;
  type?: string;
  isGuest?: boolean;
  placeholder?: string;
  multiline?: boolean;
}

export default function EditableField({ 
  value, 
  onSave, 
  type = "text", 
  isGuest,
  placeholder = "...",
  multiline = false
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  if (isGuest) return <span className="px-1 text-slate-600">{value || placeholder}</span>;

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== (value || "")) {
      onSave(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value || "");
    }
  };

  if (isEditing) {
    return multiline ? (
      <textarea
        autoFocus
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-gramm="false"
        className="w-full border border-slate-200 rounded-md outline-none px-2 py-1 bg-slate-50 text-slate-700 font-medium min-h-15 focus:border-blue-300 focus:bg-blue-50"
      />
    ) : (
      <input
        type={type}
        autoFocus
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="border border-slate-200 rounded-md outline-none px-2 py-1 bg-slate-50 text-slate-700 font-medium focus:border-blue-300 focus:bg-blue-50"
      />
    );
  }

  return (
    <span 
      onClick={() => {
        setTempValue(value || "");
        setIsEditing(true);
      }} 
      className={`cursor-pointer hover:bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md transition-colors wrap-break-word ${multiline ? "whitespace-pre-wrap" : "whitespace-normal"}`}
      title="Cliquer pour modifier"
    >
      {value || placeholder}
    </span>
  );
}