import { useEffect, useState } from "react";
import WidgetFrame from "../WidgetFrame";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  ROLE_INVITE, 
  useAddMembreToTache, 
  useAddTache, 
  useDeleteMembreFromTache, 
  useDeleteTache, 
  useGetEtatTache, 
  useGetMembreByTache, 
  useGetTacheGroupe, 
  useGetTacheMembre, 
  useUpdateEtatTache, 
  type MembreDTO, 
  type TacheDTO 
} from "../../services/WidgetService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { User } from "../../pages/UpdateUserPage";
import ModalFormulaire from "../ModalFormulaire";
import { CircleX, UserRoundX, Check } from "lucide-react"; // Ajout de 'Check'
import { ROLE_MEMBRE, useGetUserByGroupe } from "../../services/membreService";

export default function WidgetTaches({ onClose, isGuest }: { onClose?: () => void; isGuest?: boolean }) {
  const [taches, setTaches] = useState<TacheDTO[]>([]);
  const [membres, setMembres] = useState<Record<number, MembreDTO[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etats, setEtats] = useState<string[]>([]); 
  const [nom,setNom] = useState("");
  const [description,setDescription] = useState("");
  const [dateDebut,setDateDebut] = useState("");
  const [dateFin,setDateFin] = useState("");
  const [etat,setEtat] = useState("");
  const [membresGroupe, setMembresGroupe] = useState<MembreDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermAdd, setSearchTermAdd] = useState("");
  
  const [selectedMembresIds, setSelectedMembresIds] = useState<number[]>([]);

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

  const toggleMembreSelection = (membreId: number) => {
    setSelectedMembresIds((prev) => 
      prev.includes(membreId)
        ? prev.filter((id) => id !== membreId) 
        : [...prev, membreId] 
    );
  };

  const handleSubmitTache = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const data: TacheDTO = {
      id: 0,
      nom: nom,
      description: description,
      dateDebut: dateDebut || null,
      dateLimite: dateFin || null,
      etat: etat,
      membresIds: selectedMembresIds,
    };

    const newTache = await addTache(data);
    
    if (newTache && newTache.id && selectedMembresIds.length > 0) {
      await Promise.all(
        selectedMembresIds.map(membreId => addMembreToTache(newTache.id, membreId))
      );
    }
    
    await refreshGroupData();
    
    setIsModalOpen(false);
    setNom("");
    setDescription("");
    setDateDebut("");
    setDateFin("");
    setSelectedMembresIds([]);
    setSearchTermAdd("");
    if (etats.length > 0) setEtat(etats[0]);
  };

  const handleDeleteTache = async (id: number) => {
    await DeleteTache(id);
    refreshGroupData();
  };

  const handleRemoveMembre = async (tacheId: number, membreId: number) => {
    await RemoveMembre(tacheId, membreId);
    refreshGroupData();
  };

  const handleAddMembreToTache = async (tacheId: number, membreId: number) => {
    await addMembreToTache(tacheId, membreId);
    refreshGroupData();
  };

  useEffect(() => {
    if (!context?.groupeActifId || context?.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_TACHES") {
            refreshGroupData();
          }
        });
      },
    });
    refreshGroupData();
    stompClient.activate();
    return () => { void stompClient.deactivate(); };
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
  }, []);

  async function refreshGroupData() {
    if (!context?.groupeActifId) {
      return null;
    }

    const [resultatGroupe] = await Promise.all([
      GetTachesByGroupe(),  
    ]);

    setTaches(resultatGroupe);

    const membresMap: Record<number, MembreDTO[]> = {};
    await Promise.all(
      resultatGroupe.map(async (tache: TacheDTO) => {
        if (tache.id !== undefined) {
          const resultatUser = await GetMembreByTache(tache.id);
          membresMap[tache.id] = resultatUser || [];
        }
      })
    );
    setMembres(membresMap);
    const resultatTousMembres = await GetUsersbyGroupe(Number(context.groupeActifId));
    setMembresGroupe(resultatTousMembres);
  }

  const GetTachesUser = async () => {
    if (!context?.auth.idUser) {
      return null;
    }
    const resultatUser = await GetTachesByUser();
    setTaches(resultatUser);
  };

  useEffect(() => {
    refreshGroupData();
  }, []);

  const filteredTaches = taches.filter((tache: TacheDTO) => {
    const fullName = `${tache.nom} ${tache.description} ${tache.etat} ${tache.dateDebut} ${tache.dateLimite}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const filteredMembresAdd = membresGroupe.filter((m) => 
    `${m.nom} ${m.prenom}`.toLowerCase().includes(searchTermAdd.toLowerCase())
  );

  return (
    <WidgetFrame
      title="Tâches à faire"
      headerColor="bg-blue-600"
      onClose={onClose}
    >
      <ul className="space-y-2 p-3">
        <input
          type="text"
          placeholder="Rechercher par nom, description, etat, date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        {filteredTaches.map((tache) => (
          <li
            key={tache.id}
            className="flex items-center gap-2 text-sm p-2 hover:bg-slate-50 rounded"
          >
            {tache.nom}{" "}
            {tache.description}{" "}
            {!isGuest ? (
              <select value={tache.etat} onChange={(e) => tache.id !== undefined && updateEtatTache(tache.id, e.target.value)}>
                {etats.map((etat) => (
                  <option key={etat} value={etat}>
                    {etat.replace("_", " ").toLowerCase()}
                  </option>
                ))}
              </select>
            ) : (
              <p>{tache.etat.replace("_", " ").toLowerCase()}</p>
            )}{" "}
            {tache.dateDebut}{" "}
            {tache.dateLimite}{" "}
            <div className="flex -space-x-2 gap-2">
              {tache.id !== undefined && membres[tache.id]?.map((membre: MembreDTO) => (
                <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] pl-2 pr-1 py-0.5 rounded-full border border-white" key={membre.id} title={`${membre.nom} ${membre.prenom}`}>
                  {membre.nom}{" "}{membre.prenom}{" "}{membre.id} 
                  {!isGuest && (
                    <button 
                      onClick={() => handleRemoveMembre(tache.id as number, membre.id as number)} 
                      className="hover:text-red-600 hover:bg-red-100 text-red-500 rounded-full p-0.5 transition-colors"
                      title="Retirer ce membre de la tâche"
                    >
                      <UserRoundX size={12}/>
                    </button>
                  )}
                </span>
              ))}
            </div>
            {!isGuest && (
              <button onClick={() => handleDeleteTache(tache.id as number)} className="hover:text-red-600 text-red-500 font-medium py-2 rounded transition-colors ml-auto">
                <CircleX/>
              </button>
            )}
          </li>
        ))}
      </ul>
      
      {!isGuest && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors"
        >
          + Nouvelle Tâche
        </button>
      )}
      
      <ModalFormulaire
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter une tâche"
      >
        <form onSubmit={handleSubmitTache} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la tâche</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description de la tâche</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début (optionnel)</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel)</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">État de la tâche</label>
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

          <div className="border-t border-gray-200 mt-2 pt-3">
            <label className="block text-sm font-bold text-gray-700 mb-1">Assigner des membres (optionnel)</label>
            <input 
              type="text" 
              placeholder="Rechercher un membre..." 
              value={searchTermAdd}
              onChange={(e) => setSearchTermAdd(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 mb-2 text-sm outline-none focus:border-blue-500" 
            />
            
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-white">
              {filteredMembresAdd.length === 0 ? (
                <p className="p-2 text-xs text-gray-500 text-center">Aucun membre trouvé.</p>
              ) : (
                filteredMembresAdd.map((membre) => {
                  const isSelected = selectedMembresIds.includes(membre.id as number);
                  return (
                    <div 
                      key={membre.id}
                      onClick={() => toggleMembreSelection(membre.id as number)}
                      className={`flex items-center justify-between p-2 text-sm cursor-pointer transition-colors border-b border-gray-100 last:border-0
                        ${isSelected ? 'bg-blue-50 text-blue-800 font-medium' : 'hover:bg-gray-50 text-gray-700'}
                      `}
                    >
                      <span>{membre.prenom} {membre.nom}</span>
                      {isSelected && <Check size={16} className="text-blue-600" />}
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