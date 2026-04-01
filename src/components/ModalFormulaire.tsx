import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom"; // 🚀 L'IMPORT MAGIQUE EST ICI

interface ModalFormulaireProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode; 
}

export default function ModalFormulaire({ isOpen, onClose, title, children }: ModalFormulaireProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">        
        
        <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100 shrink-0">
          <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="hover:bg-slate-200 p-1 rounded-md transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-white overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
        
      </div>
    </div>,
    document.body
  );
}