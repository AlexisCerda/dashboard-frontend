import type { ReactNode } from "react";
import { X } from "lucide-react";

interface WidgetFrameProps {
  title: string;          
  children: ReactNode;    
  onClose?: () => void;   
  headerColor?: string;   
}

export default function WidgetFrame({ 
  title, 
  children, 
  onClose, 
  headerColor = "bg-slate-800",
}: WidgetFrameProps) {

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      
      <div className={`${headerColor} text-white px-3 py-2 text-sm font-semibold flex justify-between items-center cursor-move drag-handle`}>
        <span>{title}</span>
        
        {onClose && (
          <button 
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()} 
            className="hover:bg-black/20 p-1 rounded transition-colors cursor-pointer"
            title="Fermer le widget"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {children}
      </div>
      
    </div>
  );
}