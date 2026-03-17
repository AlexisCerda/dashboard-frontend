import WidgetFrame from "../WidgetFrame";
import { CheckCircle2, Circle } from "lucide-react";

export default function WidgetImage({ onClose }: { onClose?: () => void }) {
  const taches = [
    { id: 1, titre: "Mettre à jour le serveur VPN", fait: false },
    { id: 2, titre: "Créer les comptes", fait: true },
  ];

  return (
    <WidgetFrame
      title="Image"
      headerColor="bg-blue-600"
      onClose={onClose}
    >
      <ul className="space-y-2 p-3">
        {taches.map((tache) => (
          <li
            key={tache.id}
            className="flex items-center gap-2 text-sm p-2 hover:bg-slate-50 rounded"
          >
            {tache.fait ? (
              <CheckCircle2 className="text-green-500 w-4 h-4" />
            ) : (
              <Circle className="text-gray-400 w-4 h-4" />
            )}
            <span
              className={
                tache.fait ? "line-through text-gray-400" : "text-gray-700"
              }
            >
              {tache.titre}
            </span>
          </li>
        ))}
      </ul>
    </WidgetFrame>
  );
}
