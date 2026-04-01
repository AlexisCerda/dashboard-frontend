import { useEffect, useRef, useState, memo, useContext } from "react";
import WidgetFrame from "../WidgetFrame";
import { AuthContext } from "../../context/AuthContext";
import {
  useCreatePret,
  useDeletePret,
  useGetAllEtatsPret,
  useGetPretGroupe,
  useUpdateEtatPret,
  useUpdatePret,
} from "../../services/pretService";
import { useGetConfig } from "../../services/configService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import { CircleX, ChevronUp, ChevronDown, CirclePlus } from "lucide-react";
import EditableField from "../EditableField";

const COMPACT_LAYOUT_BREAKPOINT = 380;

export interface PretDTO {
  id: number;
  nomMateriel: string;
  marqueMateriel: string;
  nomPersonne: string;
  prenomPersonne: string;
  quantite: number;
  etat: string;
  dateDebut: string;
  dateFin: string;
}

const WidgetPrets = memo(function WidgetPrets({
  onClose,
  isGuest,
  isInteracting = false,
}: {
  onClose?: () => void;
  isGuest?: boolean;
  isInteracting?: boolean;
}) {
  const [prets, setPrets] = useState<PretDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etats, setEtats] = useState<string[]>([]);
  const [nomMateriel, setNomMateriel] = useState("");
  const [marqueMateriel, setMarqueMateriel] = useState("");
  const [nomPersonne, setNomPersonne] = useState("");
  const [prenomPersonne, setPrenomPersonne] = useState("");
  const [quantite, setQuantite] = useState<number>(1);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [etat, setEtat] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const [configLimits, setConfigLimits] = useState<{ maxPrets?: number } | null>(null);
  const [erreur, setErreur] = useState("");

  const context = useContext(AuthContext);
  const getPretGroupe = useGetPretGroupe();
  const updateEtatPret = useUpdateEtatPret();
  const getAllEtatsPret = useGetAllEtatsPret();
  const createPret = useCreatePret();
  const deletePret = useDeletePret();
  const updatePret = useUpdatePret();
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

  const handleSubmitPret = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      configLimits?.maxPrets !== undefined &&
      prets.length >= configLimits.maxPrets
    ) {
      setErreur("Nombre maximum de prêts atteint");
      setIsModalOpen(false);
      setNomMateriel("");
      setMarqueMateriel("");
      setNomPersonne("");
      setPrenomPersonne("");
      setQuantite(0);
      setDateDebut("");
      setDateFin("");
      setEtat("");
      return;
    }

    const data: PretDTO = {
      id: 0,
      nomMateriel,
      marqueMateriel,
      nomPersonne,
      prenomPersonne,
      quantite: Number(quantite),
      dateDebut: dateDebut || (null as any),
      dateFin: dateFin || (null as any),
      etat: etat,
    };

    await createPret(data);
    await refreshData();
    setErreur("");

    setIsModalOpen(false);
    setNomMateriel("");
    setMarqueMateriel("");
    setNomPersonne("");
    setPrenomPersonne("");
    setQuantite(1);
    setDateDebut("");
    setDateFin("");
    if (etats.length > 0) setEtat(etats[0]);
  };

  const handleDeletePret = async (id: number) => {
    await deletePret(id);
    refreshData();
  };

  const handleUpdateField = async (pret: PretDTO) => {
    if (isGuest) return;
    await updatePret(pret);
    refreshData();
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

  useEffect(() => {
    if (!context?.groupeActifId || context?.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "/ws"),

      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_PRETS") {
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
        const resultat = await getAllEtatsPret();
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
      const resultatGroupe = await getPretGroupe();
      setPrets(
        (resultatGroupe || []).map((pret: PretDTO) => ({
          ...pret,
          dateDebut: formatDate(pret.dateDebut),
          dateFin: formatDate(pret.dateFin),
        })),
      );
    } catch (error) {
      console.error("Erreur", error);
    }
  }

  const filteredPrets = prets.filter((p) => {
    const searchString =
      `${p.nomMateriel} ${p.marqueMateriel} ${p.prenomPersonne} ${p.nomPersonne} ${p.etat.replace("_", " ")} ${p.dateDebut} ${p.dateFin}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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
      return dateString;
    }
  };

  return (
    <WidgetFrame
      title="Prêts de Matériel"
      headerColor="bg-amber-500 text-white border-b border-amber-600"
      onClose={onClose}
      options={headerActions}
    >
      <div ref={widgetContainerRef} className="flex flex-col h-full p-3">
        {isInteracting ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
             <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin" />
             <p className="text-xs font-medium italic">Optimisation en cours...</p>
          </div>
        ) : (
          <>
            {erreur && (
              <div className="mb-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium">
                {erreur}
              </div>
            )}
            <div className="mb-3">
              {!isSearchCollapsed && (
                <input
                  type="text"
                  placeholder="Rechercher un prêt, matériel, emprunteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-amber-200 bg-amber-50/60 text-slate-700 p-2 rounded-lg w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              )}
            </div>

            <ul className="space-y-2 flex-1 overflow-y-auto">
              {filteredPrets.map((p) => (
                <li
                  key={p.id}
                  className={`${isCompactLayout ? "flex flex-col" : "grid grid-cols-[minmax(0,1fr)_9rem] items-start"} gap-3 text-sm p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200`}
                >
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <div className={`${isCompactLayout ? "flex-wrap" : "flex-nowrap"} font-semibold text-slate-800 flex items-center gap-1 overflow-hidden`}>
                      <span className="text-gray-400 font-normal">Qte:</span>
                      <EditableField
                        value={String(p.quantite)}
                        type="number"
                        onSave={(newVal) => {
                          p.quantite = Number(newVal);
                          handleUpdateField(p);
                        }}
                        isGuest={isGuest}
                        noWrap={!isCompactLayout}
                      />
                      <span>-</span>
                      <EditableField
                        value={p.nomMateriel}
                        onSave={(newVal) => {
                          p.nomMateriel = newVal;
                          handleUpdateField(p);
                        }}
                        isGuest={isGuest}
                        placeholder="Matériel"
                        noWrap={!isCompactLayout}
                      />
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <EditableField
                        value={p.marqueMateriel}
                        onSave={(newVal) => {
                          p.marqueMateriel = newVal;
                          handleUpdateField(p);
                        }}
                        isGuest={isGuest}
                        placeholder="Marque"
                        noWrap={!isCompactLayout}
                      />
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400">Période:</span>
                      <EditableField
                        value={p.dateDebut}
                        type="date"
                        isGuest={isGuest}
                        onSave={(newVal) => {
                          p.dateDebut = formatDate(newVal);
                          handleUpdateField(p);
                        }}
                        placeholder="Début"
                        noWrap={false}
                      />
                      <span className="text-gray-300">→</span>
                      <EditableField
                        value={p.dateFin}
                        type="date"
                        isGuest={isGuest}
                        onSave={(newVal) => {
                          p.dateFin = formatDate(newVal);
                          handleUpdateField(p);
                        }}
                        placeholder="Fin"
                        noWrap={false}
                      />
                    </div>

                    <div className={`${isCompactLayout ? "flex-wrap" : "flex-nowrap"} text-[11px] text-gray-500 flex gap-1 mt-1 overflow-hidden`}>
                      <span>Emprunteur :</span>
                      <EditableField
                        value={p.prenomPersonne}
                        onSave={(newVal) => {
                          p.prenomPersonne = newVal;
                          handleUpdateField(p);
                        }}
                        isGuest={isGuest}
                        placeholder="Prénom"
                        noWrap={!isCompactLayout}
                      />
                      <EditableField
                        value={p.nomPersonne}
                        onSave={(newVal) => {
                          p.nomPersonne = newVal;
                          handleUpdateField(p);
                        }}
                        isGuest={isGuest}
                        placeholder="Nom"
                        noWrap={!isCompactLayout}
                      />
                    </div>
                  </div>

                  <div className={`flex ${isCompactLayout ? "w-full flex-row items-center justify-end mt-2" : "w-full flex-col items-end"} gap-2`}>
                    {p.etat &&
                      (!isGuest ? (
                        <select
                          value={p.etat}
                          onChange={async (e) => {
                            if (p.id !== undefined) {
                              await updateEtatPret(p.id, e.target.value);
                              await refreshData();
                            }
                          }}
                          className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-full"} text-xs p-1.5 rounded-lg border border-amber-200 outline-none bg-amber-50 text-amber-800`}
                        >
                          {etats.map((etat) => (
                            <option key={etat} value={etat}>
                              {etat.replace("_", " ").toLowerCase()}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-full"} text-center text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-medium`}>
                          {p.etat.replace("_", " ").toLowerCase()}
                        </p>
                      ))}

                    {!isGuest && (
                      <button
                        onClick={() => handleDeletePret(p.id)}
                        className="shrink-0 hover:text-red-600 text-red-500 font-medium p-1 rounded transition-colors"
                        title="Supprimer ce prêt"
                      >
                        <CircleX size={18} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {filteredPrets.length === 0 && (
                <p className="text-center text-gray-400 mt-4 text-xs italic">
                  Aucun prêt en cours.
                </p>
              )}
            </ul>
          </>
        )}
      </div>

      <ModalFormulaire
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau Prêt de Matériel"
      >
        <form onSubmit={handleSubmitPret} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matériel emprunté
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
                placeholder="Ex: Vidéoprojecteur"
                autoFocus
                required
                value={nomMateriel}
                onChange={(e) => setNomMateriel(e.target.value)}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
                required
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque (optionnel)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
              placeholder="Ex: Epson"
              value={marqueMateriel}
              onChange={(e) => setMarqueMateriel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-200 mt-2 pt-3">
            <div className="sm:col-span-2">
              <span className="block text-xs font-bold text-gray-500 uppercase">
                Emprunteur
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
                required
                value={prenomPersonne}
                onChange={(e) => setPrenomPersonne(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
                required
                value={nomPersonne}
                onChange={(e) => setNomPersonne(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-200 mt-2 pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'emprunt (optionnel)
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retour prévu (optionnel)
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>

          {etats.length > 0 && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                État du prêt
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500"
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
            className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded transition-colors"
          >
            Enregistrer le Prêt
          </button>
        </form>
      </ModalFormulaire>
    </WidgetFrame>
  );
});

export default WidgetPrets;
