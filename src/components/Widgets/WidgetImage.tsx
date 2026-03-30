import { useEffect, useState, useContext, memo } from "react";
import WidgetFrame from "../WidgetFrame";
import { AuthContext } from "../../context/AuthContext";
import {
  useCreateImageByMembre,
  useDeleteImage,
  useGetImagesByMembre,
  useUpdateImageByMembre,
  type ImageDTO,
} from "../../services/imageService";
import { useGetConfig } from "../../services/configService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ModalFormulaire from "../ModalFormulaire";
import {
  CircleX,
  ChevronUp,
  ChevronDown,
  CirclePlus,
  Image as ImageIcon,
  Maximize,
  ArrowLeft,
} from "lucide-react";
import EditableField from "../EditableField";

const MAX_FILE_SIZE_MB = 5;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080/";

const WidgetImages = memo(function WidgetImages({
  widgetId,
  onClose,
  isGuest,
  isInteracting = false,
}: {
  widgetId: string;
  onClose?: () => void;
  isGuest?: boolean;
  isInteracting?: boolean;
}) {
  const [images, setImages] = useState<ImageDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [configLimits, setConfigLimits] = useState<{
    maxImages?: number;
  } | null>(null);
  const [erreur, setErreur] = useState("");
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const context = useContext(AuthContext);
  const getImagesByMembre = useGetImagesByMembre();
  const updateImageByMembre = useUpdateImageByMembre();
  const createImageByMembre = useCreateImageByMembre();
  const deleteImage = useDeleteImage();
  const getConfig = useGetConfig();

  useEffect(() => {
    if (widgetId) {
      const savedImageId = localStorage.getItem(`widget_image_${widgetId}`);
      if (savedImageId) {
        setSelectedImageId(Number(savedImageId));
      }
    }
  }, [widgetId]);

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

  const handleSubmitImage = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setErreur("");

    if (
      configLimits?.maxImages !== undefined &&
      images.length >= configLimits.maxImages
    ) {
      setErreur("Nombre maximum d'images atteint.");
      return;
    }

    if (!selectedFile) {
      setErreur("Veuillez sélectionner un fichier.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErreur(`L'image dépasse la taille maximale (${MAX_FILE_SIZE_MB} Mo).`);
      return;
    }

    try {
      await createImageByMembre(selectedFile);
      await refreshData();
      setIsModalOpen(false);
      setSelectedFile(null);
      setErreur("");
    } catch (error: any) {
      setErreur(
        error.message || "Erreur lors de l'envoi du fichier au serveur.",
      );
    }
  };

  const handleDeleteImage = async (id: number) => {
    await deleteImage(id);
    if (selectedImageId === id) handleRemoveSelection(); 
    refreshData();
  };

  const handleUpdateField = async (image: ImageDTO) => {
    if (isGuest) return;
    await updateImageByMembre(image);
    refreshData();
  };

  const handleSelectImage = (id: number) => {
    setSelectedImageId(id);
    localStorage.setItem(`widget_image_${widgetId}`, String(id));
  };

  const handleRemoveSelection = () => {
    setSelectedImageId(null);
    localStorage.removeItem(`widget_image_${widgetId}`);
  };

  useEffect(() => {
    if (!context?.auth.idUser) return;

    const frequence = `/topic/membre/${context.auth.idUser}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),

      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_IMAGES") refreshData();
        });
      },
    });
    refreshData();

    const activationTimer = window.setTimeout(
      () => stompClient.activate(),
      400,
    );
    return () => {
      window.clearTimeout(activationTimer);
      if (stompClient.active) void stompClient.deactivate();
    };
  }, [context?.auth.idUser]);

  async function refreshData() {
    if (!context?.auth.idUser) return;
    try {
      const resultat = await getImagesByMembre();
      setImages(resultat || []);
      setRefreshKey(Date.now());
    } catch (error) {
      console.error("Erreur", error);
    }
  }

  const filteredImages = images.filter((img) =>
    (img.nom || "").toLowerCase().includes((searchTerm || "").toLowerCase()),
  );

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

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        onMouseDown={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/30 bg-white/15 text-white hover:bg-white/25 transition-all"
        title="Ajouter une image"
      >
        <CirclePlus size={18} />
      </button>
    </>
  );

  if (isInteracting) {
    return (
      <WidgetFrame
        title="Images"
        headerColor="bg-indigo-500 text-white border-b border-indigo-600"
        onClose={onClose}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60 h-full bg-white">
           <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
           <p className="text-xs font-medium italic">Optimisation en cours...</p>
        </div>
      </WidgetFrame>
    );
  }

  if (selectedImageId) {
    const img = images.find((i) => i.id === selectedImageId);
    if (img) {
      const imageSrcBase = img.path?.startsWith("http")
        ? img.path
        : `${SERVER_URL}${img.path}`;
      const imageSrc = `${imageSrcBase}?t=${refreshKey}`;
      return (
        <WidgetFrame
          title={img.nom || "Image"}
          headerColor="bg-slate-800 text-white border-b border-slate-900"
          onClose={onClose}
          options={
            <button
              onClick={handleRemoveSelection}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-white/40 bg-white/15 text-white hover:bg-white/25 transition-colors"
              title="Retour à la galerie"
            >
              <ArrowLeft size={16} />
            </button>
          }
        >
          <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              src={imageSrc}
              alt={img.nom}
              className="w-full h-full max-w-full max-h-full object-contain rounded-lg shadow-md"
              style={{ display: "block" }}
            />
          </div>
        </WidgetFrame>
      );
    }
  }

  return (
    <WidgetFrame
      title="Ma Galerie Images"
      headerColor="bg-indigo-500 text-white border-b border-indigo-600"
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
              placeholder="Rechercher une image..."
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-indigo-200 bg-indigo-50/60 text-slate-700 p-2 rounded-lg w-full min-w-0 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-300 mt-6">
              <ImageIcon size={40} className="mb-2 opacity-50" />
              <p className="text-xs text-center italic">
                Aucune image enregistrée.
              </p>
            </div>
          ) : (
            <div className="flex flex-row flex-wrap gap-3 pb-2">
              {filteredImages.map((img) => {
                const imageSrcBase = img.path?.startsWith("http")
                  ? img.path
                  : `${SERVER_URL}${img.path}`;
                const imageSrc = `${imageSrcBase}?t=${refreshKey}`;

                return (
                  <div
                    key={img.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex flex-col min-w-[120px] max-w-[140px]"
                  >
                    <div className="w-full aspect-square overflow-hidden bg-slate-100 relative flex items-center justify-center">
                      <img
                        src={imageSrc}
                        alt={img.nom || "Image"}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x400/e2e8f0/94a3b8?text=Fichier+introuvable";
                        }}
                      />
                      <button
                        onClick={() => handleSelectImage(img.id)}
                        className="absolute top-2 left-2 p-1.5 bg-indigo-600/90 text-white hover:bg-indigo-500 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
                        title="Afficher cette image dans le widget"
                      >
                        <Maximize size={16} />
                      </button>
                    </div>

                    <div className="bg-white px-2 py-1.5 border-t border-slate-100">
                      <EditableField
                        value={img.nom || ""}
                        onSave={(newVal) => {
                          img.nom = newVal;
                          handleUpdateField(img);
                        }}
                        isGuest={isGuest}
                      />
                    </div>

                    {!isGuest && (
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 p-1 bg-white/90 text-red-500 hover:bg-red-500 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        title="Supprimer cette image"
                      >
                        <CircleX size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ModalFormulaire
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErreur("");
        }}
        title="Ajouter une image"
      >
        <form onSubmit={handleSubmitImage} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier (Max {MAX_FILE_SIZE_MB} Mo)
            </label>
            <input
              type="file"
              accept="image/*"
              required
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-300 rounded p-1"
              onChange={(e) =>
                setSelectedFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition-colors"
          >
            Téléverser l'image
          </button>
        </form>
      </ModalFormulaire>
    </WidgetFrame>
  );
});

export default WidgetImages;
