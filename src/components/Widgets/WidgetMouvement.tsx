import { useEffect, useRef, useState, memo, useContext } from "react";
import WidgetFrame from "../WidgetFrame";
import { AuthContext } from "../../context/AuthContext";
import { 
  useCreateMouvement, 
  useDeleteMouvement, 
  useGetAllEtatsMouvement, 
  useGetMouvementGroupe, 
  useUpdateEtatMouvement, 
  useUpdateMouvement,
  type MouvementDTO,
} from "../../services/mouvementService";
import { useGetConfig } from "../../services/configService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import { CircleX, ChevronUp, ChevronDown, CirclePlus, LogIn, LogOut, Ticket, Building2, UserCircle } from "lucide-react"; 
import EditableField from "../EditableField";

const COMPACT_LAYOUT_BREAKPOINT = 360;

const WidgetMouvements = memo(function WidgetMouvements({ 
  onClose, 
  isGuest,
  isInteracting = false 
}: { 
  onClose?: () => void; 
  isGuest?: boolean;
  isInteracting?: boolean;
}) {
  const [mouvements, setMouvements] = useState<MouvementDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etats, setEtats] = useState<string[]>([]); 
  
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [etat, setEtat] = useState("");
  const [service, setService] = useState("");
  const [statut, setStatut] = useState("");
  const [urlTicketGlpi, setUrlTicketGlpi] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const [configLimits, setConfigLimits] = useState<{ maxMouvements?: number } | null>(null);
  const [erreur, setErreur] = useState("");

  const context = useContext(AuthContext);
  const getMouvementGroupe = useGetMouvementGroupe();
  const updateEtatMouvement = useUpdateEtatMouvement();
  const getAllEtatsMouvement = useGetAllEtatsMouvement();
  const createMouvement = useCreateMouvement();
  const deleteMouvement = useDeleteMouvement();
  const updateMouvement = useUpdateMouvement();
  const getConfig = useGetConfig();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await getConfig();
        setConfigLimits(cfg ?? null);
      } catch (error) {
        console.error("Erreur récupération config", error);
      }
    };

    fetchConfig();
  }, [getConfig]);

  const handleSubmitMouvement = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      configLimits?.maxMouvements !== undefined &&
      mouvements.length >= configLimits.maxMouvements
    ) {
      setErreur("Nombre maximum de mouvements atteint");
      setIsModalOpen(false);
      setNom("");
      setPrenom("");
      setDateArrivee("");
      setDateDepart("");
      setEtat("");
      setService("");
      setStatut("");
      setUrlTicketGlpi("");
      return;
    }
    
    const data: MouvementDTO = {
      id: 0,
      nom: nom,
      prenom: prenom,
      dateArrivee: dateArrivee || null as any,
      dateDepart: dateDepart || null as any,
      etat : etat,
      service: service || null as any,
      statut: statut || null as any,
      urlTicketGlpi: urlTicketGlpi || null as any,
    };

    await createMouvement(data);
    await refreshData();
    setErreur("");
    
    setIsModalOpen(false);
    setNom("");
    setPrenom("");
    setDateArrivee("");
    setDateDepart("");
    setService("");
    setStatut("");
    setUrlTicketGlpi("");
    if (etats.length > 0) setEtat(etats[0]);
  };

  const handleDeleteMouvement = async (id: number) => {
    await deleteMouvement(id);
    refreshData();
  };

  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdateField = async (mouvement: MouvementDTO) => {
    if (isGuest) return;
    setUpdateError(null);
    
    // Optimistic Update: Update the local state immediately
    if (mouvement.id) {
      setMouvements(prev => prev.map(m => m.id === mouvement.id ? mouvement : m));
    }
    
    try {
      // Ensure empty fields are sent as null for consistency with backend
      const payload: MouvementDTO = {
        ...mouvement,
        service: mouvement.service || null as any,
        statut: mouvement.statut || null as any,
        urlTicketGlpi: mouvement.urlTicketGlpi || null as any
      };
      
      await updateMouvement(payload);
      await refreshData();
    } catch (error: any) {
      console.error("Erreur mise à jour mouvement:", error);
      setUpdateError(`Échec de la sauvegarde: ${error.message || "Erreur serveur"}`);
      await refreshData();
      // Clear error after 3 seconds
      setTimeout(() => setUpdateError(null), 3000);
    }
  };

  useEffect(() => {
    if (!context?.groupeActifId || context?.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),

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
    }, 400);

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
    const searchString = `${m.nom} ${m.prenom} ${m.etat?.replace("_", " ")} ${m.dateArrivee} ${m.dateDepart} ${m.service || ""} ${m.statut || ""}`.toLowerCase();
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
        {isInteracting ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
             <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-purple-500 animate-spin" />
             <p className="text-xs font-medium italic">Optimisation en cours...</p>
          </div>
        ) : (
          <>
            {erreur && (
              <div className="mb-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium">
                {erreur}
              </div>
            )}
            {updateError && (
              <div className="mb-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-[10px] font-bold animate-pulse shadow-sm">
                ⚠️ {updateError}
              </div>
            )}
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
                        onSave={(newVal) => { handleUpdateField({ ...m, prenom: newVal }); }} 
                        isGuest={isGuest}
                        placeholder="Prénom"
                      />
                      <EditableField
                        value={m.nom} 
                        onSave={(newVal) => { handleUpdateField({ ...m, nom: newVal }); }} 
                        isGuest={isGuest}
                        placeholder="Nom"
                      />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs mt-2 font-medium">
                      <div className="flex items-center gap-2 px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100 shadow-sm" title="Arrivée">
                        <LogIn size={14} className="shrink-0 text-green-500" />
                        <EditableField
                          value={m.dateArrivee} 
                          type="date"
                          isGuest={isGuest}
                          onSave={(newVal) => { handleUpdateField({ ...m, dateArrivee: formatDate(newVal) }); }} 
                        />
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 shadow-sm" title="Départ">
                        <LogOut size={14} className="shrink-0 text-red-400" />
                        <EditableField
                          value={m.dateDepart} 
                          type="date"
                          isGuest={isGuest}
                          onSave={(newVal) => { handleUpdateField({ ...m, dateDepart: formatDate(newVal) }); }} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shadow-sm" title="Modifier le service">
                        <Building2 size={10} className="text-indigo-400" />
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter mr-0.5">Service:</span>
                        <EditableField 
                          value={m.service || ""}
                          onSave={(newVal) => { handleUpdateField({ ...m, service: newVal }); }}
                          placeholder="Non défini"
                          isGuest={isGuest}
                        />
                      </div>
                      
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 shadow-sm" title="Modifier le statut">
                        <UserCircle size={10} className="text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-tighter mr-0.5">Statut:</span>
                        <EditableField 
                          value={m.statut || ""}
                          onSave={(newVal) => { handleUpdateField({ ...m, statut: newVal }); }}
                          placeholder="Non défini"
                          isGuest={isGuest}
                        />
                      </div>

                      <div className="flex items-center flex-wrap gap-2">
                        {m.urlTicketGlpi && (
                          <a 
                            href={m.urlTicketGlpi} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm hover:shadow-md active:scale-95 group"
                            title="Ouvrir le Ticket GLPI"
                          >
                            <Ticket size={12} className="group-hover:rotate-12 transition-transform" />
                            Ticket GLPI
                          </a>
                        )}
                        
                        {!isGuest && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors" title="Modifier l'URL du Ticket">
                            <Ticket size={10} className="text-blue-400 shrink-0" />
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter mr-0.5">Ticket:</span>
                            <EditableField 
                              value={m.urlTicketGlpi || ""}
                              onSave={(newVal) => { handleUpdateField({ ...m, urlTicketGlpi: newVal }); }}
                              placeholder={m.urlTicketGlpi ? "Détails" : "+ Ajouter lien"}
                              isGuest={isGuest}
                            />
                          </div>
                        )}
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
          </>
        )}
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

          <div className={`grid ${isCompactLayout ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Service</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500 text-sm" 
                placeholder="Ex: BFLI, BCL..." 
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Statut</label>
              <input 
                type="text" 
                list="statuts-list" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500 text-sm" 
                placeholder="Ex: Contractuel(le)..." 
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
              />
              <datalist id="statuts-list">
                <option value="Titulaire" />
                <option value="Contractuel(le)" />
                <option value="Stagiaire" />
                <option value="Apprenti(e)" />
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien Ticket GLPI</label>
            <input 
              type="url" 
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-purple-500 text-sm" 
              placeholder="https://glpi.exemple.fr/..." 
              value={urlTicketGlpi}
              onChange={(e) => setUrlTicketGlpi(e.target.value)}
            />
          </div>

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
});

export default WidgetMouvements;