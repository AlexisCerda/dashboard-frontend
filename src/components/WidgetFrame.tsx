import type { ReactNode } from "react";
import { X } from "lucide-react";

interface WidgetFrameProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  headerColor?: string;
  options?: ReactNode;
}

export default function WidgetFrame({
  title,
  children,
  onClose,
  headerColor = "bg-slate-700 text-white border-b border-slate-800",
  options,
}: WidgetFrameProps) {
  return (
    <div className="flex flex-col h-full min-w-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div
        className={`${headerColor} px-4 py-2.5 text-sm font-semibold flex items-center gap-3 cursor-move drag-handle`}
      >
        <span>{title}</span>
        {options && <div className="flex items-center gap-2">{options}</div>}
        {onClose && (
          <button
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="ml-auto hover:bg-black/15 p-1 rounded-md transition-colors cursor-pointer text-inherit opacity-80 hover:opacity-100"
            title="Fermer le widget"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden bg-white">{children}</div>
    </div>
  );
}
