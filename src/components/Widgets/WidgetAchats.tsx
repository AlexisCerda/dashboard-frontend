import { useEffect, useRef, useState } from "react";
import WidgetFrame from "../WidgetFrame";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  useCreateAchat,
  useDeleteAchat,
  useGetAllEtatsAchat,
  useGetAchatGroupe,
  useUpdateEtatAchat,
  useUpdateAchat,
} from "../../services/WidgetService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import { CircleX, ChevronUp, ChevronDown, CirclePlus } from "lucide-react";
import EditableField from "../EditableField";

const COMPACT_LAYOUT_BREAKPOINT = 380;

export interface AchatDTO {
  id: number;
  nomMateriel: string;
  marqueMateriel: string;
  reference: string;
  nomPersonne: string;
  prenomPersonne: string;
  quantite: number;
  etat: string;
}

export default function WidgetAchats({
  onClose,
  isGuest,
}: {
  onClose?: () => void;
  isGuest?: boolean;
}) {
  const [achats, setAchats] = useState<AchatDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etats, setEtats] = useState<string[]>([]);

  const [nomMateriel, setNomMateriel] = useState("");
  const [marqueMateriel, setMarqueMateriel] = useState("");
  const [reference, setReference] = useState("");
  const [nomPersonne, setNomPersonne] = useState("");
  const [prenomPersonne, setPrenomPersonne] = useState("");
  const [quantite, setQuantite] = useState<number>(1);
  const [etat, setEtat] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  const context = useContext(AuthContext);
  const getAchatGroupe = useGetAchatGroupe();
  const updateEtatAchat = useUpdateEtatAchat();
  const getAllEtatsAchat = useGetAllEtatsAchat();
  const createAchat = useCreateAchat();
  const deleteAchat = useDeleteAchat();
  const updateAchat = useUpdateAchat();

  const handleSubmitAchat = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const data: AchatDTO = {
      id: 0,
      nomMateriel,
      marqueMateriel,
      reference,
      nomPersonne,
      prenomPersonne,
      quantite: Number(quantite),
      etat: etat,
    };

    await createAchat(data);
    await refreshData();

    setIsModalOpen(false);
    setNomMateriel("");
    setMarqueMateriel("");
    setReference("");
    setNomPersonne("");
    setPrenomPersonne("");
    setQuantite(1);
    if (etats.length > 0) setEtat(etats[0]);
  };

  const handleDeleteAchat = async (id: number) => {
    await deleteAchat(id);
    refreshData();
  };

  const handleUpdateField = async (achat: AchatDTO) => {
    if (isGuest) return;
    await updateAchat(achat);
    refreshData();
  };
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
  useEffect(() => {
    if (!context?.groupeActifId || context?.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_ACHATS") {
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
        const resultat = await getAllEtatsAchat();
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
      const resultatGroupe = await getAchatGroupe();
      setAchats(resultatGroupe || []);
    } catch (error) {
      console.error("Erreur", error);
    }
  }

  const filteredAchats = achats.filter((a) => {
    const searchString =
      `${a.nomMateriel} ${a.marqueMateriel} ${a.reference} ${a.prenomPersonne} ${a.nomPersonne} ${a.etat.replace("_", " ")}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <WidgetFrame
      title="Demandes d'Achats"
      headerColor="bg-emerald-600 text-white border-b border-emerald-700"
      onClose={onClose}
      options={headerActions}
    >
      <div ref={widgetContainerRef} className="flex flex-col h-full p-3">
        <div className="mb-3">
          {!isSearchCollapsed && (
            <input
              type="text"
              placeholder="Rechercher un achat, matériel, demandeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-emerald-200 bg-emerald-50/60 text-slate-700 p-2 rounded-lg w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          )}
        </div>

        <ul className="space-y-2 flex-1 overflow-y-auto">
          {filteredAchats.map((a) => (
            <li
              key={a.id}
              className={`${isCompactLayout ? "flex flex-col" : "grid grid-cols-[minmax(0,1fr)_9rem] items-start"} gap-3 text-sm p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200`}
            >
              <div className="flex flex-col flex-1 min-w-0 gap-1">
                <div className={`${isCompactLayout ? "flex-wrap" : "flex-nowrap"} font-semibold text-slate-800 flex items-center gap-1 overflow-hidden`}>
                  <span className="text-gray-400 font-normal">Qte:</span>
                  <EditableField
                    value={String(a.quantite)}
                    type="number"
                    onSave={(newVal) => {
                      a.quantite = Number(newVal);
                      handleUpdateField(a);
                    }}
                    isGuest={isGuest}
                    noWrap={!isCompactLayout}
                  />
                  <span>-</span>
                  <EditableField
                    value={a.nomMateriel}
                    onSave={(newVal) => {
                      a.nomMateriel = newVal;
                      handleUpdateField(a);
                    }}
                    isGuest={isGuest}
                    placeholder="Matériel"
                    noWrap={!isCompactLayout}
                  />
                </div>

                <div className={`${isCompactLayout ? "flex-wrap" : "flex-nowrap"} text-xs text-slate-500 flex items-center gap-2 overflow-hidden`}>
                  <EditableField
                    value={a.marqueMateriel}
                    onSave={(newVal) => {
                      a.marqueMateriel = newVal;
                      handleUpdateField(a);
                    }}
                    isGuest={isGuest}
                    placeholder="Marque"
                    noWrap={!isCompactLayout}
                  />
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">Réf:</span>
                  <EditableField
                    value={a.reference}
                    onSave={(newVal) => {
                      a.reference = newVal;
                      handleUpdateField(a);
                    }}
                    isGuest={isGuest}
                    placeholder="Aucune réf."
                    noWrap={!isCompactLayout}
                  />
                </div>

                <div className={`${isCompactLayout ? "flex-wrap" : "flex-nowrap"} text-[11px] text-gray-500 flex gap-1 mt-1 overflow-hidden`}>
                  <span>Demandé par :</span>
                  <EditableField
                    value={a.prenomPersonne}
                    onSave={(newVal) => {
                      a.prenomPersonne = newVal;
                      handleUpdateField(a);
                    }}
                    isGuest={isGuest}
                    placeholder="Prénom"
                    noWrap={!isCompactLayout}
                  />
                  <EditableField
                    value={a.nomPersonne}
                    onSave={(newVal) => {
                      a.nomPersonne = newVal;
                      handleUpdateField(a);
                    }}
                    isGuest={isGuest}
                    placeholder="Nom"
                    noWrap={!isCompactLayout}
                  />
                </div>
              </div>

              <div className={`flex ${isCompactLayout ? "w-full flex-row items-center justify-end mt-2" : "w-full flex-col items-end"} gap-2`}>
                {a.etat &&
                  (!isGuest ? (
                    <select
                      value={a.etat}
                      onChange={async (e) => {
                        if (a.id !== undefined) {
                          await updateEtatAchat(a.id, e.target.value);
                          await refreshData();
                        }
                      }}
                      className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-full"} text-xs p-1.5 rounded-lg border border-emerald-200 outline-none bg-emerald-50 text-emerald-800`}
                    >
                      {etats.map((etat) => (
                        <option key={etat} value={etat}>
                          {etat.replace("_", " ").toLowerCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className={`${isCompactLayout ? "w-auto min-w-36 max-w-[70%]" : "w-full"} text-center text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-medium`}>
                      {a.etat.replace("_", " ").toLowerCase()}
                    </p>
                  ))}

                {!isGuest && (
                  <button
                    onClick={() => handleDeleteAchat(a.id)}
                    className="shrink-0 hover:text-red-600 text-red-500 font-medium p-1 rounded transition-colors"
                    title="Supprimer cet achat"
                  >
                    <CircleX size={18} />
                  </button>
                )}
              </div>
            </li>
          ))}
          {filteredAchats.length === 0 && (
            <p className="text-center text-gray-400 mt-4 text-xs italic">
              Aucun achat enregistré.
            </p>
          )}
        </ul>
      </div>

      <ModalFormulaire
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle demande d'achat"
      >
        <form onSubmit={handleSubmitAchat} className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matériel
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="Ex: Ordinateur portable"
                autoFocus
                required
                value={nomMateriel}
                onChange={(e) => setNomMateriel(e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-emerald-500"
                required
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marque (optionnel)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="Ex: Dell"
                value={marqueMateriel}
                onChange={(e) => setMarqueMateriel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence (optionnel)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="Ex: XPS 13"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 mt-2 pt-3">
            <div className="col-span-2">
              <span className="block text-xs font-bold text-gray-500 uppercase">
                Demandeur
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom (optionnel)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-emerald-500"
                value={prenomPersonne}
                onChange={(e) => setPrenomPersonne(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom (optionnel)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-emerald-500"
                value={nomPersonne}
                onChange={(e) => setNomPersonne(e.target.value)}
              />
            </div>
          </div>

          {etats.length > 0 && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                État de la demande
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-emerald-500"
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
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition-colors"
          >
            Enregistrer la demande
          </button>
        </form>
      </ModalFormulaire>
    </WidgetFrame>
  );
}
