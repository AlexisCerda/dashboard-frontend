import { useEffect, useState } from "react";
import WidgetFrame from "../WidgetFrame";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  useCreateNoteByMembre, 
  useDeleteNote, 
  useGetNotesByMembre, 
  useUpdateNoteByMembre, 
} from "../../services/WidgetService";
import { useGetConfig } from "../../services/membreService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import { CircleX, ChevronUp, ChevronDown, CirclePlus } from "lucide-react"; 
import EditableField from "../EditableField";

export interface NoteDTO {
  id: number;
  description: string;
}

export default function WidgetNotes({ onClose }: { onClose?: () => void; isGuest?: boolean }) {
  const [notes, setNotes] = useState<NoteDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [configLimits, setConfigLimits] = useState<{ maxNotes?: number } | null>(null);
  const [erreur, setErreur] = useState("");

  const context = useContext(AuthContext);
  const getNotesByMembre = useGetNotesByMembre();
  const updateNoteByMembre = useUpdateNoteByMembre();
  const createNoteByMembre = useCreateNoteByMembre();
  const deleteNote = useDeleteNote();
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

  const handleSubmitNote = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      configLimits?.maxNotes !== undefined &&
      notes.length >= configLimits.maxNotes
    ) {
      setErreur("Nombre maximum de notes atteint");
      setIsModalOpen(false);
      setDescription("");
      return;
    }
    
    const data: NoteDTO = {
      id: 0,
      description,
    };

    try {
      await createNoteByMembre(data);
      await refreshData();
      setIsModalOpen(false);
      setDescription("");
      setErreur("");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    refreshData();
  };

  const handleUpdateField = async (note: NoteDTO) => {
    await updateNoteByMembre(note);
    refreshData();
  };

  useEffect(() => {
    if (!context?.auth.idUser) return;

    const frequence = `/topic/membre/${context.auth.idUser}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),

      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_NOTES") { 
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
  }, [context?.auth.idUser]);

  async function refreshData() {
    if (!context?.auth.idUser) return;
    try {
      const resultat = await getNotesByMembre();
      setNotes(resultat || []);
    } catch (error) {
      console.error("Erreur", error);
    }
  }

  const filteredNotes = notes.filter((n) => {
    return n.description.toLowerCase().includes(searchTerm.toLowerCase());
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
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        onMouseDown={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/30 bg-white/15 text-white hover:bg-white/25 transition-all"
        title="Ajouter"
      >
        <CirclePlus size={18} />
      </button>
    </>
  );

  return (
    <WidgetFrame
      title="Mes Notes Personnelles"
      headerColor="bg-orange-500 text-white border-b border-orange-600"
      onClose={onClose}
      options={headerActions}
    >
      <div className="flex flex-col h-full p-3">
        {erreur && (
          <div className="mb-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium">
            {erreur}
          </div>
        )}
        <div className="mb-3">
          {!isSearchCollapsed && (
            <input
              type="text"
              placeholder="Rechercher dans mes notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-orange-200 bg-orange-50/60 text-slate-700 p-2 rounded-lg w-full min-w-0 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          )}
        </div>

        <ul className="space-y-2 flex-1 overflow-y-auto">
          {filteredNotes.map((n) => (
            <li
              key={n.id}
              className="flex items-start gap-2 text-sm p-3 bg-amber-50/60 hover:bg-amber-50 rounded-lg border border-amber-100 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <EditableField
                  value={n.description} 
                  onSave={(newVal) => { n.description = newVal; handleUpdateField(n); }} 
                  multiline={true}
                />
              </div>
                <button 
                  onClick={() => handleDeleteNote(n.id)} 
                  className="hover:text-red-600 text-red-500 font-medium p-1 rounded transition-colors ml-auto shrink-0"
                  title="Supprimer cette note"
                >
                  <CircleX size={18} />
                </button>
            </li>
          ))}
          {filteredNotes.length === 0 && (
            <p className="text-center text-gray-400 mt-4 text-xs italic">Aucune note enregistrée.</p>
          )}
        </ul>
      </div>
      
      <ModalFormulaire
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter une note"
      >
        <form onSubmit={handleSubmitNote} className="flex flex-col gap-3">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-yellow-500 min-h-25" 
              placeholder="Ex: Manger 5 fruits et légumes par jour..." 
              autoFocus
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-gramm="false"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded transition-colors"
          >
            Enregistrer la note
          </button>
        </form>
      </ModalFormulaire>
    </WidgetFrame>
  );
}
