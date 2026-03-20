import { useEffect, useRef, useState } from "react";
import WidgetFrame from "../WidgetFrame";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  useCreateMouvement, 
  useDeleteMouvement, 
  useGetAllEtatsMouvement, 
  useGetMouvementGroupe, 
  useUpdateEtatMouvement, 
  useUpdateMouvement, 
} from "../../services/WidgetService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import { CircleX, ChevronUp, ChevronDown, CirclePlus } from "lucide-react"; 
import EditableField from "../EditableField";

const COMPACT_LAYOUT_BREAKPOINT = 360;

export interface MouvementDTO {
  id: number;
  nom: string;
  prenom: string;
  dateArrivee: string;
  dateDepart: string;  
  etat : string; 
}

export default function WidgetMouvements({ onClose, isGuest }: { onClose?: () => void; isGuest?: boolean }) {
  const [mouvements, setMouvements] = useState<MouvementDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etats, setEtats] = useState<string[]>([]); 
  
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [etat, setEtat] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  const context = useContext(AuthContext);
  const getMouvementGroupe = useGetMouvementGroupe();
  const updateEtatMouvement = useUpdateEtatMouvement();
  const getAllEtatsMouvement = useGetAllEtatsMouvement();
  const createMouvement = useCreateMouvement();
  const deleteMouvement = useDeleteMouvement();
  const updateMouvement = useUpdateMouvement();

  const handleSubmitMouvement = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const data: MouvementDTO = {
      id: 0,
      nom: nom,
      prenom: prenom,
      dateArrivee: dateArrivee || null as any,
      dateDepart: dateDepart || null as any,
      etat : etat,
    };

    await createMouvement(data);
    await refreshData();
    
    setIsModalOpen(false);
    setNom("");
    setPrenom("");
    setDateArrivee("");
    setDateDepart("");
    if (etats.length > 0) setEtat(etats[0]);
  };

  const handleDeleteMouvement = async (id: number) => {
    await deleteMouvement(id);
    refreshData();
  };

  const handleUpdateField = async (mouvement: MouvementDTO) => {
    if (isGuest) return;
    await updateMouvement(mouvement);
    refreshData();
  };

  useEffect(() => {
    if (!context?.groupeActifId || context?.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_MOUVEMENTS") { 
            refreshData();
          }
        });
      },
    });
    refreshData();

    const activationTimer = window.setTimeout(() => {
      stompClient.activate();
    }, 150);

    return () => {
      window.clearTimeout(activationTimer);
      if (stompClient.active) {
        void stompClient.deactivate();
      }
    };
  }, [context?.groupeActifId, context?.auth.idUser]);

  useEffect(() => {
    const fetchEtats = async () => {
      try {
        const resultat = await getAllEtatsMouvement();
        setEtats(resultat);
        if (resultat.length > 0 && !etat) {
          setEtat(resultat[0]);
        }
      } catch (error) {
        console.error("Erreur récupération états", error);
      }
    };
    fetchEtats();
  }, []);

  useEffect(() => {
    const container = widgetContainerRef.current;
    if (!container) return;

    const observedElement =
      (container.closest(".react-grid-item") as HTMLElement | null) ?? container;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry?.contentRect.width ?? observedElement.clientWidth;
      if (width > 0) {
        setIsCompactLayout(width <= COMPACT_LAYOUT_BREAKPOINT);
      }
    });

    observer.observe(observedElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  async function refreshData() {
    if (!context?.groupeActifId) return;
    try {
      const resultatGroupe = await getMouvementGroupe();
      setMouvements(resultatGroupe || []);
    } catch (error) {
      console.error("Erreur", error);
    }
  }

  const filteredMouvements = mouvements.filter((m) => {
    const searchString = `${m.nom} ${m.prenom} ${m.etat?.replace("_", " ")} ${m.dateArrivee} ${m.dateDepart}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => setIsSearchCollapsed((prev) => !prev)}
        onMouseDown={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-white/40 bg-white/15 text-white hover:bg-white/25 transition-colors"
        title={isSearchCollapsed ? "Déplier la recherche" : "Rétracter la recherche"}
      >
        {isSearchCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      {!isGuest && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          onMouseDown={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/30 bg-white/15 text-white hover:bg-white/25 transition-all"
          title="Ajouter"
        >
          <CirclePlus size={18} />
        </button>
      )}
    </>
  );

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      if (!dateString.includes("/")) return dateString;
      const date = dateString.split("/");
      const day = String(date[0]).padStart(2, "0");
      const month = String(date[1]).padStart(2, "0");
      const year = date[2];
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <WidgetFrame
      title="Mouvements (Arrivées / Départs)"
      headerColor="bg-purple-600 text-white border-b border-purple-700"
      onClose={onClose}
      options={headerActions}
    >
      <div ref={widgetContainerRef} className="flex flex-col h-full p-3">
        <div className="mb-3">
          {!isSearchCollapsed && (
            <input
              type="text"
              placeholder="Rechercher une personne, une date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-purple-200 bg-purple-50/60 text-slate-700 p-2 rounded-lg w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          )}
        </div>

        <ul className="space-y-2 flex-1 overflow-y-auto">
          {filteredMouvements.map((m) => (
            <li
              key={m.id}
              className={`${isCompactLayout ? "flex flex-col" : "flex flex-row items-start"} gap-3 text-sm p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200`}
            >
              <div className="flex flex-col flex-1 gap-1">
                <div className="font-semibold text-slate-800 flex flex-wrap gap-1">
                  <EditableField
                    value={m.prenom} 
                    onSave={(newVal) => { m.prenom = newVal; handleUpdateField(m); }} 
                    isGuest={isGuest}
                    placeholder="Prénom"
                  />
                  <EditableField
                    value={m.nom} 
                    onSave={(newVal) => { m.nom = newVal; handleUpdateField(m); }} 
                    isGuest={isGuest}
                    placeholder="Nom"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <div className="flex items-center gap-1 text-green-600">
                    <span title="Arrivée">▶</span>
                    <EditableField
                      value={m.dateArrivee} 
                      type="date"
                      isGuest={isGuest}
                      onSave={(newVal) => { m.dateArrivee = formatDate(newVal); handleUpdateField(m); }} 
                    />
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <span title="Départ">◀</span>
                    <EditableField
                      value={m.dateDepart} 
                      type="date"
                      isGuest={isGuest}
                      onSave={(newVal) => { m.dateDepart = formatDate(newVal); handleUpdateField(m); }} 
                    />
                  </div>
                </div>
              </div>
              <div className={`flex ${isCompactLayout ? "w-full" : "w-auto self-start"} items-center justify-end gap-2`}>
                {m.etat && (
                  !isGuest ? (
                    <select 
                      value={m.etat} 
                      onChange={async (e) => {
                        if (m.id !== undefined) {
                          await updateEtatMouvement(m.id, e.target.value);
                          await refreshData();
                        }
                      }}
                      className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-36"} text-xs p-1.5 rounded-lg border border-purple-200 outline-none bg-purple-50 text-purple-800`}
                    >
                      {etats.map((etat) => (
                        <option key={etat} value={etat}>
                          {etat.replace("_", " ").toLowerCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-36"} text-center text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full font-medium`}>{m.etat.replace("_", " ").toLowerCase()}</p>
                  )
                )}

                {!isGuest && (
                  <button 
                    onClick={() => handleDeleteMouvement(m.id)} 
                    className="shrink-0 hover:text-red-600 text-red-500 font-medium p-1 rounded transition-colors"
                  >
                    <CircleX size={18} />
                  </button>
                )}
              </div>
            </li>
          ))}
          {filteredMouvements.length === 0 && (
            <p className="text-center text-gray-400 mt-4 text-xs italic">Aucun mouvement enregistré.</p>
          )}
        </ul>
        
      </div>
      
      <ModalFormulaire
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Enregistrer un mouvement"
      >
        <form onSubmit={handleSubmitMouvement} className="flex flex-col gap-3">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500" 
                placeholder="Ex: Jean" 
                autoFocus
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500" 
                placeholder="Ex: Dupont" 
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée (optionnel)</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500" 
                value={dateArrivee}
                onChange={(e) => setDateArrivee(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ (optionnel)</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500" 
                value={dateDepart}
                onChange={(e) => setDateDepart(e.target.value)}
              />
            </div>
          </div>
          
          {etats.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500" 
                required
                value={etat}
                onChange={(e) => setEtat(e.target.value)}
              >
                {etats.map((etat) => (
                  <option key={etat} value={etat}>
                    {etat.replace("_", " ").toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition-colors"
          >
            Enregistrer
          </button>
        </form>
      </ModalFormulaire>
    </WidgetFrame>
  );
}