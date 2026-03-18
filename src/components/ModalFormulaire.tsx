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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">        
        
        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button 
            onClick={onClose}
            className="hover:bg-slate-700 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-slate-50">
          {children}
        </div>
        
      </div>
    </div>,
    document.body
  );
}