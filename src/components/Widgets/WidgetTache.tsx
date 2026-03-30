import { useEffect, useState, useRef } from "react";
import WidgetFrame from "../WidgetFrame";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  useAddMembreToTache,
  useAddTache,
  useDeleteMembreFromTache,
  useDeleteTache,
  useGetEtatTache,
  useGetMembreByTache,
  useGetTacheGroupe,
  useGetTacheMembre,
  useUpdateEtatTache,
  useUpdateTache,
  type TacheDTO,
} from "../../services/tacheService";
import { useGetMouvementGroupe, type MouvementDTO } from "../../services/mouvementService";
import { type MembreDTO } from "../../services/userService";
import { useGetConfig } from "../../services/configService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import {
  CircleX,
  UserRoundX,
  Check,
  ChevronUp,
  ChevronDown,
  CirclePlus,
  Link,
  Ticket,
  UserCircle,
} from "lucide-react";
import { useGetUserByGroupe } from "../../services/groupeService";
import EditableField from "../EditableField";

const COMPACT_LAYOUT_BREAKPOINT = 420;

export default function WidgetTaches({
  onClose,
  isGuest,
}: {
  onClose?: () => void;
  isGuest?: boolean;
}) {
  const [taches, setTaches] = useState<TacheDTO[]>([]);
  const [membres, setMembres] = useState<Record<number, MembreDTO[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etats, setEtats] = useState<string[]>([]);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [etat, setEtat] = useState("");
  const [membresGroupe, setMembresGroupe] = useState<MembreDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermAdd, setSearchTermAdd] = useState("");
  const [selectedMembresIds, setSelectedMembresIds] = useState<number[]>([]);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(false);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [configLimits, setConfigLimits] = useState<{ maxTaches?: number } | null>(null);
  const [erreur, setErreur] = useState("");
  const [mouvements, setMouvements] = useState<MouvementDTO[]>([]);
  const [selectedMouvementId, setSelectedMouvementId] = useState<number | "">("");
  const [addingMembreForTacheId, setAddingMembreForTacheId] = useState<number | null>(null);
  const [inlineSearchTerm, setInlineSearchTerm] = useState("");
  const showMyTasksRef = useRef(showMyTasksOnly);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const inlineDropdownRef = useRef<HTMLDivElement | null>(null);

  const context = useContext(AuthContext);
  const GetTachesByGroupe = useGetTacheGroupe();
  const GetTachesByUser = useGetTacheMembre();
  const GetMembreByTache = useGetMembreByTache();
  const updateEtatTache = useUpdateEtatTache();
  const GetEtatTache = useGetEtatTache();
  const addTache = useAddTache();
  const DeleteTache = useDeleteTache();
  const RemoveMembre = useDeleteMembreFromTache();
  const addMembreToTache = useAddMembreToTache();
  const GetUsersbyGroupe = useGetUserByGroupe();
  const UpdateTache = useUpdateTache();
  const getConfig = useGetConfig();
  const getMouvementGroupe = useGetMouvementGroupe();

  useEffect(() => {
    showMyTasksRef.current = showMyTasksOnly;
  }, [showMyTasksOnly]);

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

  const toggleMembreSelection = (membreId: number) => {
    setSelectedMembresIds((prev) =>
      prev.includes(membreId)
        ? prev.filter((id) => id !== membreId)
        : [...prev, membreId],
    );
  };

  const handleSubmitTache = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (
      configLimits?.maxTaches !== undefined &&
      taches.length >= configLimits.maxTaches
    ) {
      setErreur("Nombre maximum de tâches atteint");
      setIsModalOpen(false);
      setNom("");
      setDescription("");
      setDateDebut("");
      setDateFin("");
      setSelectedMembresIds([]);
      return;
    }

    const data: TacheDTO = {
      id: 0,
      nom: nom,
      description: description,
      dateDebut: dateDebut || null,
      dateLimite: dateFin || null,
      etat: etat,
      membresIds: selectedMembresIds,
      mouvement: selectedMouvementId === "" ? null : { id: Number(selectedMouvementId) } as any,
    };

    const newTache = await addTache(data);
    setErreur("");

    if (newTache && newTache.id && selectedMembresIds.length > 0) {
      await Promise.all(
        selectedMembresIds.map((membreId) =>
          addMembreToTache(newTache.id as number, membreId),
        ),
      );
    }

    await refreshData();

    setIsModalOpen(false);
    setNom("");
    setDescription("");
    setDateDebut("");
    setDateFin("");
    setSelectedMembresIds([]);
    setSearchTermAdd("");
    setSelectedMouvementId("");
    if (etats.length > 0) setEtat(etats[0]);
  };

  const handleDeleteTache = async (id: number) => {
    await DeleteTache(id);
    refreshData();
  };

  const handleRemoveMembre = async (tacheId: number, membreId: number) => {
    await RemoveMembre(tacheId, membreId);
    refreshData();
  };

  const handleUpdateField = async (tache: TacheDTO) => {
    if (isGuest) return;
    
    // Optimistic Update: Update the local state immediately
    setTaches(prev => prev.map(t => t.id === tache.id ? tache : t));
    
    try {
      await UpdateTache(tache);
      await refreshData();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche", error);
      // Rollback if needed
      await refreshData();
    }
  };

  const handleAddMembreInline = async (tacheId: number, membreId: number) => {
    await addMembreToTache(tacheId, membreId);
    setAddingMembreForTacheId(null);
    setInlineSearchTerm("");
    refreshData();
  };

  useEffect(() => {
    if (!context?.groupeActifId || context?.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),

      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_TACHES") {
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
      const resultat = await GetEtatTache();
      setEtats(resultat);
      if (resultat.length > 0 && !etat) {
        setEtat(resultat[0]);
      }
    };
    fetchEtats();
  }, [GetEtatTache, etat]);

  useEffect(() => {
    const fetchMouvements = async () => {
      try {
        const result = await getMouvementGroupe();
        setMouvements(result || []);
      } catch (error) {
        console.error("Erreur récupération mouvements", error);
      }
    };
    fetchMouvements();
  }, [getMouvementGroupe]);

  async function refreshData() {
    if (!context?.groupeActifId) return;

    const isMyTasks = showMyTasksRef.current;

    const [resultatGroupe] = await Promise.all([
      isMyTasks ? GetTachesByUser() : GetTachesByGroupe(),
    ]);

    setTaches(
      (resultatGroupe || []).map((tache: TacheDTO) => ({
        ...tache,
        dateDebut: tache.dateDebut ? formatDate(tache.dateDebut) : null,
        dateLimite: tache.dateLimite ? formatDate(tache.dateLimite) : null,
      })),
    );

    const membresMap: Record<number, MembreDTO[]> = {};
    if (resultatGroupe) {
      await Promise.all(
        resultatGroupe.map(async (tache: TacheDTO) => {
          if (tache.id !== undefined) {
            const resultatUser = await GetMembreByTache(tache.id);
            membresMap[tache.id] = resultatUser || [];
          }
        }),
      );
    }
    setMembres(membresMap);

    const resultatTousMembres = await GetUsersbyGroupe(
      Number(context.groupeActifId),
    );
    setMembresGroupe(resultatTousMembres);
    return true;
  }

  useEffect(() => {
    refreshData();
  }, [showMyTasksOnly]);

  const filteredTaches = taches.filter((tache: TacheDTO) => {
    const fullName =
      `${tache.nom} ${tache.description} ${tache.etat.replace("_", " ").toLowerCase()} ${tache.dateDebut} ${tache.dateLimite}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const filteredMembresAdd = membresGroupe.filter((m) =>
    `${m.nom} ${m.prenom}`.toLowerCase().includes(searchTermAdd.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      if (dateString.includes("T")) {
        return dateString.split("T")[0];
      }
      if (!dateString.includes("/")) return dateString;
      const date = dateString.split("/");
      const day = String(date[0]).padStart(2, "0");
      const month = String(date[1]).padStart(2, "0");
      const year = date[2];
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error(error);
      return dateString;
    }
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => setIsSearchCollapsed((prev) => !prev)}
        onMouseDown={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-white/40 bg-white/15 text-white hover:bg-white/25 transition-colors"
        title={
          isSearchCollapsed ? "Déplier la recherche" : "Rétracter la recherche"
        }
      >
        {isSearchCollapsed ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronUp size={16} />
        )}
      </button>
      <label
        className="flex items-center gap-2 text-xs font-medium text-white bg-white/15 border border-white/30 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-white/25 transition-colors whitespace-nowrap"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={showMyTasksOnly}
          onChange={(e) => setShowMyTasksOnly(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
        Mes tâches
      </label>
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

  return (
    <WidgetFrame
      title="Tâches à faire"
      headerColor="bg-blue-600 text-white border-b border-blue-700"
      onClose={onClose}
      options={headerActions}
    >
      <div ref={widgetContainerRef} className="flex flex-col h-full p-3">
        {erreur && (
          <div className="mb-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium">
            {erreur}
          </div>
        )}
        <div className="mb-3">
          {!isSearchCollapsed && (
            <input
              type="text"
              placeholder="Rechercher par nom, description, etat, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-blue-200 bg-blue-50/60 text-slate-700 p-2 rounded-lg w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          )}
        </div>

        <ul className="space-y-2 flex-1 overflow-y-auto">
          {filteredTaches.map((tache) => (
            <li
              key={tache.id}
              className={`${isCompactLayout ? "flex flex-col" : "grid grid-cols-[minmax(0,1fr)_9rem] items-start"} gap-3 p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 text-sm`}
            >
              <div className="flex flex-col flex-1 min-w-0 gap-1 overflow-hidden">
                <div className={`flex flex-wrap font-semibold text-slate-800 items-center gap-1`}>
                  <EditableField
                    value={tache.nom}
                    onSave={(newVal) => {
                      handleUpdateField({ ...tache, nom: newVal });
                    }}
                    isGuest={isGuest || showMyTasksOnly}
                    placeholder="Tâche"
                    noWrap={false}
                  />
                  <span className="text-gray-300">|</span>
                  <EditableField
                    value={tache.description}
                    isGuest={isGuest || showMyTasksOnly}
                    placeholder="Description"
                    onSave={(newVal) => {
                      handleUpdateField({ ...tache, description: newVal });
                    }}
                    noWrap={false}
                  />
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span className="text-gray-400">Période:</span>
                  <EditableField
                    value={tache.dateDebut}
                    type="date"
                    isGuest={isGuest || showMyTasksOnly}
                    onSave={(newVal) => {
                      handleUpdateField({ ...tache, dateDebut: formatDate(newVal) });
                    }}
                    placeholder="Début"
                    noWrap={false}
                  />
                  <span className="text-gray-300">→</span>
                  <EditableField
                    value={tache.dateLimite}
                    type="date"
                    isGuest={isGuest || showMyTasksOnly}
                    onSave={(newVal) => {
                      handleUpdateField({ ...tache, dateLimite: formatDate(newVal) });
                    }}
                    placeholder="Fin"
                    noWrap={false}
                  />
                </div>
                {tache.mouvementId && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-sm transition-all hover:bg-slate-100">
                      <UserCircle size={14} className="text-slate-400" />
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Lié à :</span>
                      <span className="text-xs font-bold text-slate-800">
                        {(() => {
                          const mouv = mouvements.find(m => m.id === tache.mouvementId);
                          return mouv ? `${mouv.prenom} ${mouv.nom}` : `Mouvement #${tache.mouvementId}`;
                        })()}
                      </span>
                    </div>

                    {(() => {
                      const mouv = mouvements.find(m => m.id === (tache.mouvement?.id || tache.mouvementId));
                      if (mouv?.urlTicketGlpi) {
                        return (
                          <a 
                            href={mouv.urlTicketGlpi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm hover:shadow-md active:scale-95 group"
                            title="Ouvrir le Ticket GLPI du mouvement"
                          >
                            <Ticket size={12} className="group-hover:rotate-12 transition-transform" />
                            Ticket GLPI
                          </a>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
                <div className="text-[11px] text-gray-500 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-1">
                  <span className="pt-0.5">Membres :</span>
                  <div className="flex flex-wrap items-center gap-1 min-w-0">
                    {tache.id !== undefined && membres[tache.id]?.length === 0 && (
                      <span className="text-gray-400 italic">Aucun</span>
                    )}
                    {tache.id !== undefined &&
                      membres[tache.id]?.map((membre: MembreDTO) => (
                        <span
                          className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full border border-blue-200 whitespace-nowrap max-w-full sm:max-w-40"
                          key={membre.id}
                          title={`${membre.nom} ${membre.prenom}`}
                        >
                          <span className="truncate">
                            {membre.prenom.charAt(0)}. {membre.nom}
                          </span>
                          {!isGuest && !showMyTasksOnly && (
                            <button
                              onClick={() =>
                                handleRemoveMembre(
                                  tache.id as number,
                                  membre.id as number,
                                )
                              }
                              className="hover:text-red-600 hover:bg-red-100 text-red-500 rounded-full p-0.5 transition-colors ml-1 shrink-0"
                            >
                              <UserRoundX size={10} />
                            </button>
                          )}
                        </span>
                      ))}
                    {!isGuest && !showMyTasksOnly && (
                      <div className="relative" ref={addingMembreForTacheId === tache.id ? inlineDropdownRef : null}>
                        <button
                          onClick={() => {
                            if (addingMembreForTacheId === tache.id) {
                              setAddingMembreForTacheId(null);
                              setInlineSearchTerm("");
                            } else {
                              setAddingMembreForTacheId(tache.id as number);
                              setInlineSearchTerm("");
                            }
                          }}
                          className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Ajouter un membre"
                        >
                          <CirclePlus size={12} />
                        </button>
                        {addingMembreForTacheId === tache.id && (
                          <div className="absolute z-50 left-0 top-5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg text-xs">
                            <input
                              autoFocus
                              type="text"
                              placeholder="Rechercher..."
                              value={inlineSearchTerm}
                              onChange={(e) => setInlineSearchTerm(e.target.value)}
                              className="w-full px-2 py-1.5 border-b border-slate-100 outline-none rounded-t-lg"
                            />
                            <div className="max-h-28 overflow-y-auto">
                              {membresGroupe
                                .filter((m) => {
                                  const alreadyIn = membres[tache.id as number]?.some((am) => am.id === m.id);
                                  const matchSearch = `${m.nom} ${m.prenom}`.toLowerCase().includes(inlineSearchTerm.toLowerCase());
                                  return !alreadyIn && matchSearch;
                                })
                                .map((m) => (
                                  <div
                                    key={m.id}
                                    onClick={() => handleAddMembreInline(tache.id as number, m.id as number)}
                                    className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-50 last:border-0"
                                  >
                                    {m.prenom} {m.nom}
                                  </div>
                                ))}
                              {membresGroupe.filter((m) => {
                                const alreadyIn = membres[tache.id as number]?.some((am) => am.id === m.id);
                                const matchSearch = `${m.nom} ${m.prenom}`.toLowerCase().includes(inlineSearchTerm.toLowerCase());
                                return !alreadyIn && matchSearch;
                              }).length === 0 && (
                                <p className="px-2 py-2 text-gray-400 italic text-center">Aucun membre disponible</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={`flex ${isCompactLayout ? "w-full flex-row items-center justify-end mt-2" : "w-full flex-col items-end"} gap-2`}>
                {!isGuest && !showMyTasksOnly && (
                  <div className={`${isCompactLayout ? "w-full" : "w-full"} mt-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 group hover:border-blue-300 transition-colors`}>
                    <Link size={12} className="text-slate-400 group-hover:text-blue-500" />
                    <select
                      className="bg-transparent text-[10px] font-bold text-slate-600 outline-none w-full cursor-pointer"
                      value={tache.mouvement?.id || tache.mouvementId || ""}
                      onChange={async (e) => {
                        const newMouvId = e.target.value === "" ? null : Number(e.target.value);
                        const updatedTache = { 
                          ...tache, 
                          mouvement: newMouvId ? { id: newMouvId } : null,
                          mouvementId: newMouvId 
                        } as TacheDTO;
                        await handleUpdateField(updatedTache);
                      }}
                    >
                      <option value="">-- Relier à --</option>
                      {mouvements.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nom} {m.prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!isGuest && !showMyTasksOnly ? (
                  <select
                    className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-full"} text-xs p-1.5 rounded-lg border border-blue-200 outline-none bg-blue-50 text-blue-800`}
                    value={tache.etat}
                    onChange={async (e) => {
                      if (tache.id !== undefined) {
                        await updateEtatTache(tache.id, e.target.value);
                        await refreshData();
                      }
                    }}
                  >
                    {etats.map((etat) => (
                      <option key={etat} value={etat}>
                        {etat.replace("_", " ").toLowerCase()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-full"} text-center text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full font-medium`}>
                    {tache.etat.replace("_", " ").toLowerCase()}
                  </p>
                )}

                {!isGuest && !showMyTasksOnly && (
                  <button
                    onClick={() => handleDeleteTache(tache.id as number)}
                    className="shrink-0 hover:text-red-600 text-red-500 font-medium p-1 rounded transition-colors"
                    title="Supprimer la tâche"
                  >
                    <CircleX size={18} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ModalFormulaire
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une tâche"
      >
        <form onSubmit={handleSubmitTache} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la tâche
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Nom de la tâche"
              autoFocus
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description de la tâche
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Description de la tâche"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début (optionnel)
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin (optionnel)
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              État de la tâche
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relier à un mouvement (Optionnel)
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm"
              value={selectedMouvementId}
              onChange={(e) => setSelectedMouvementId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">-- Aucune liaison --</option>
              {mouvements.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom} {m.prenom}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-200 mt-2 pt-3">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Assigner des membres (optionnel)
            </label>
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTermAdd}
              onChange={(e) => setSearchTermAdd(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 mb-2 text-sm outline-none focus:border-blue-500"
            />

            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-white">
              {filteredMembresAdd.length === 0 ? (
                <p className="p-2 text-xs text-gray-500 text-center">
                  Aucun membre trouvé.
                </p>
              ) : (
                filteredMembresAdd.map((membre) => {
                  const isSelected = selectedMembresIds.includes(
                    membre.id as number,
                  );
                  return (
                    <div
                      key={membre.id}
                      onClick={() => toggleMembreSelection(membre.id as number)}
                      className={`flex items-center justify-between p-2 text-sm cursor-pointer transition-colors border-b border-gray-100 last:border-0
                        ${isSelected ? "bg-blue-50 text-blue-800 font-medium" : "hover:bg-gray-50 text-gray-700"}
                      `}
                    >
                      <span>
                        {membre.prenom} {membre.nom}
                      </span>
                      {isSelected && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-colors"
          >
            Enregistrer
          </button>
        </form>
      </ModalFormulaire>
    </WidgetFrame>
  );
}
