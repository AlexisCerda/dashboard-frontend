import { useState } from "react";

interface EditableFieldProps {
  value: string | null;
  onSave: (val: string) => void;
  type?: string;
  isGuest?: boolean;
  placeholder?: string;
}

export default function EditableField({ 
  value, 
  onSave, 
  type = "text", 
  isGuest,
  placeholder = "..." 
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  if (isGuest) return <span className="px-1">{value || placeholder}</span>;

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
    return (
      <input
        type={type}
        autoFocus
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="border-b-2 border-blue-500 outline-none px-1 bg-blue-50 text-slate-800 font-medium"
      />
    );
  }

  return (
    <span 
      onClick={() => {
        setTempValue(value || "");
        setIsEditing(true);
      }} 
      className="cursor-pointer hover:bg-slate-200 px-1 rounded transition-colors break-all"
      title="Cliquer pour modifier"
    >
      {value || placeholder}
    </span>
  );
}