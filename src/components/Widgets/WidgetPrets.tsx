import { useEffect, useState } from "react";
import WidgetFrame from "../WidgetFrame";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  useCreatePret, 
  useDeletePret, 
  useGetAllEtatsPret, 
  useGetPretGroupe, 
  useUpdateEtatPret, 
  useUpdatePret, 
} from "../../services/WidgetService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import { CircleX, ChevronUp, ChevronDown, CirclePlus } from "lucide-react"; 
import EditableField from "../EditableField";

// L'interface exacte que tu as fournie
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

export default function WidgetPrets({ onClose, isGuest }: { onClose?: () => void; isGuest?: boolean }) {
  const [prets, setPrets] = useState<PretDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etats, setEtats] = useState<string[]>([]); 
  
  // États du formulaire
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

  const context = useContext(AuthContext);
  const getPretGroupe = useGetPretGroupe();
  const updateEtatPret = useUpdateEtatPret();
  const getAllEtatsPret = useGetAllEtatsPret();
  const createPret = useCreatePret();
  const deletePret = useDeletePret();
  const updatePret = useUpdatePret();

  const handleSubmitPret = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const data: PretDTO = {
      id: 0,
      nomMateriel,
      marqueMateriel,
      nomPersonne,
      prenomPersonne,
      quantite: Number(quantite),
      dateDebut: dateDebut || null as any,
      dateFin: dateFin || null as any,
      etat: etat,
    };

    await createPret(data);
    await refreshData();
    
    setIsModalOpen(false);
    // Reset du form
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

  useEffect(() => {
    if (!context?.groupeActifId || context?.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          // ⚠️ Assure-toi que Spring Boot envoie bien "REFRESH_PRETS" !
          if (message.body === "REFRESH_PRETS") { 
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

  async function refreshData() {
    if (!context?.groupeActifId) return;
    try {
      const resultatGroupe = await getPretGroupe();
      setPrets(resultatGroupe || []);
    } catch (error) {
      console.error("Erreur", error);
    }
  }

  const filteredPrets = prets.filter((p) => {
    const searchString = `${p.nomMateriel} ${p.marqueMateriel} ${p.prenomPersonne} ${p.nomPersonne} ${p.etat.replace("_", " ")} ${p.dateDebut} ${p.dateFin}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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
      title="Prêts de Matériel"
      headerColor="bg-amber-500 text-white border-b border-amber-600"
      onClose={onClose}
    >
      <div className="flex flex-col h-full p-3">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setIsSearchCollapsed((prev) => !prev)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              title={isSearchCollapsed ? "Déplier la recherche" : "Rétracter la recherche"}
            >
              {isSearchCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            {!isGuest && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
                title="Ajouter"
              >
                <CirclePlus/>
              </button>
            )}
          </div>
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
              className="flex flex-col xl:flex-row xl:items-start gap-3 text-sm p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex flex-col flex-1 gap-1">
                
                {/* MATÉRIEL ET QUANTITÉ */}
                <div className="font-semibold text-slate-800 flex flex-wrap items-center gap-1">
                  <span className="text-gray-400 font-normal">Qte:</span>
                  <EditableField
                    value={String(p.quantite)} 
                    type="number"
                    onSave={(newVal) => { p.quantite = Number(newVal); handleUpdateField(p); }} 
                    isGuest={isGuest}
                  />
                  <span>-</span>
                  <EditableField
                    value={p.nomMateriel} 
                    onSave={(newVal) => { p.nomMateriel = newVal; handleUpdateField(p); }} 
                    isGuest={isGuest}
                    placeholder="Matériel"
                  />
                </div>

                {/* MARQUE */}
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span className="text-gray-400">Marque:</span>
                  <EditableField
                    value={p.marqueMateriel} 
                    onSave={(newVal) => { p.marqueMateriel = newVal; handleUpdateField(p); }} 
                    isGuest={isGuest}
                    placeholder="Non spécifiée"
                  />
                </div>

                {/* EMPRUNTEUR */}
                <div className="text-[11px] text-gray-500 flex flex-wrap gap-1 mt-1">
                  <span className="font-semibold text-amber-700">Emprunteur :</span>
                  <EditableField
                    value={p.prenomPersonne} 
                    onSave={(newVal) => { p.prenomPersonne = newVal; handleUpdateField(p); }} 
                    isGuest={isGuest}
                    placeholder="Prénom"
                  />
                  <EditableField
                    value={p.nomPersonne} 
                    onSave={(newVal) => { p.nomPersonne = newVal; handleUpdateField(p); }} 
                    isGuest={isGuest}
                    placeholder="Nom"
                  />
                </div>

                {/* DATES */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1 bg-amber-50 p-1 rounded">
                  <div className="flex items-center gap-1 text-green-700">
                    <span title="Date d'emprunt">Du</span>
                    <EditableField
                      value={p.dateDebut} 
                      type="date"
                      isGuest={isGuest}
                      onSave={(newVal) => { p.dateDebut = formatDate(newVal); handleUpdateField(p); }} 
                    />
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <span title="Date de retour prévue">Au</span>
                    <EditableField
                      value={p.dateFin} 
                      type="date"
                      isGuest={isGuest}
                      onSave={(newVal) => { p.dateFin = formatDate(newVal); handleUpdateField(p); }} 
                    />
                  </div>
                </div>
              </div>

              {/* ÉTAT */}
              {p.etat && (
                !isGuest ? (
                  <select 
                    value={p.etat} 
                    onChange={async (e) => {
                      if (p.id !== undefined) {
                        await updateEtatPret(p.id, e.target.value);
                        await refreshData();
                      }
                    }}
                    className="text-xs p-1.5 rounded-lg border border-amber-200 outline-none bg-amber-50 text-amber-800"
                  >
                    {etats.map((etat) => (
                      <option key={etat} value={etat}>
                        {etat.replace("_", " ").toLowerCase()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-medium">{p.etat.replace("_", " ").toLowerCase()}</p>
                )
              )}

              {/* SUPPRIMER */}
              {!isGuest && (
                <button 
                  onClick={() => handleDeletePret(p.id)} 
                  className="hover:text-red-600 text-red-500 font-medium p-1 rounded transition-colors xl:ml-auto"
                  title="Supprimer ce prêt"
                >
                  <CircleX size={18} />
                </button>
              )}
            </li>
          ))}
          {filteredPrets.length === 0 && (
             <p className="text-center text-gray-400 mt-4 text-xs italic">Aucun prêt en cours.</p>
          )}
        </ul>
        
      </div>
      
      <ModalFormulaire
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nouveau Prêt de Matériel"
      >
        <form onSubmit={handleSubmitPret} className="flex flex-col gap-3">
          
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Matériel emprunté</label>
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
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Marque (optionnel)</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500" 
              placeholder="Ex: Epson" 
              value={marqueMateriel}
              onChange={(e) => setMarqueMateriel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 mt-2 pt-3">
            <div className="col-span-2">
              <span className="block text-xs font-bold text-gray-500 uppercase">Emprunteur</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500" 
                required
                value={prenomPersonne}
                onChange={(e) => setPrenomPersonne(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500" 
                required
                value={nomPersonne}
                onChange={(e) => setNomPersonne(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 mt-2 pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'emprunt (optionnel)</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-amber-500" 
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retour prévu (optionnel)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">État du prêt</label>
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
}