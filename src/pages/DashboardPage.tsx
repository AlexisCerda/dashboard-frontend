import { useCallback, useContext, useEffect, useState, useRef, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import SelectGroupe from "../components/SelectGroupe";
import { ButtonAdminGroupe } from "../components/ButtonAdminGroupe";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { LogOut, SquarePlus, X, Plus } from "lucide-react";
import ConfirmModal from "../components/ConfirmeModalProps";
import {
  useCreateConfiguration,
  useDeleteConfiguration,
  useGetConfig,
  useGetConfiguration,
  useUpdateConfiguration,
} from "../services/configService";
import {
  useGetUsersByRoleGroupe,
  useRemoveUserByGroupe,
} from "../services/groupeService";
import { ROLE_ADMIN, ROLE_INVITE } from "../services/apiConfig";
import type { User } from "../types/User";
import { Link, Navigate } from "react-router-dom";

import RGL, { WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import WidgetTaches from "../components/Widgets/WidgetTache";
import WidgetNotes from "../components/Widgets/WidgetNotes";
import WidgetAchats from "../components/Widgets/WidgetAchats";
import WidgetPrets from "../components/Widgets/WidgetPrets";
import WidgetMouvements from "../components/Widgets/WidgetMouvement";
import WidgetImages from "../components/Widgets/WidgetImage";
import WidgetEquipe from "../components/Widgets/WidgetEquipe";
import type { Configuration } from "../types/Configuration";

const ReactGridLayout = WidthProvider(RGL);

const WIDGETS_SINGLETONS: string[] = [
  "Taches",
  "Notes",
  "Achats",
  "Prets",
  "Mouvements",
  "Equipe",
];

export default function DashboardPage() {
  const context = useContext(AuthContext);
  const GetConfigAdmin = useGetConfig();
  const GetUsersByRole = useGetUsersByRoleGroupe();
  const GetConfig = useGetConfiguration();
  const UpdateConfig = useUpdateConfiguration();
  const DeleteConfig = useDeleteConfiguration();
  const CreateConfig = useCreateConfiguration();
  const RemoveUser = useRemoveUserByGroupe();

  const [configCurrent, setConfigCurrent] = useState<number | null>(null);
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<number | null>(null);
  const [erreur, setErreur] = useState("");
  const [isCreatingConfig, setIsCreatingConfig] = useState(false);
  const [newConfigName, setNewConfigName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const [layout, setLayout] = useState<any[]>([]);
  const loadedConfigId = useRef<number | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isInteracting, setIsInteracting] = useState(false);

  const toggleGridInteractionClass = useCallback((active: boolean) => {
    setIsInteracting(active);
    document.body.classList.toggle("widget-interacting", active);
  }, []);

  const availableWidgets = WIDGETS_SINGLETONS.filter(
    (widgetName) => !layout.some((item) => item.i === widgetName),
  );
  if (!context?.auth.idUser || !context?.auth.token) {
    return <Navigate to="/login" replace />;
  }
  useEffect(() => {
    if (configCurrent !== null && configs.length > 0) {
      if (loadedConfigId.current !== configCurrent) {
        const currentConfig = configs.find((c) => c.id === configCurrent);
        if (currentConfig) {
          const newLayout: any[] = [];

          const parseWidget = (id: string, dataStr: any) => {
            if (
              dataStr &&
              typeof dataStr === "string" &&
              dataStr !== "null" &&
              dataStr.trim() !== ""
            ) {
              try {
                newLayout.push({ i: id, ...JSON.parse(dataStr) });
              } catch (e) {
                console.error(`Erreur parsing layout pour ${id}`, e);
              }
            }
          };

          parseWidget("Taches", currentConfig.taches);
          parseWidget("Notes", currentConfig.notes);
          parseWidget("Achats", currentConfig.achats);
          parseWidget("Prets", currentConfig.prets);
          parseWidget("Mouvements", currentConfig.mouvements);
          parseWidget("Equipe", currentConfig.equipe);

          if (
            currentConfig.images &&
            typeof currentConfig.images === "string" &&
            currentConfig.images.trim() !== "null"
          ) {
            try {
              const imagesLayouts = JSON.parse(currentConfig.images);
              if (Array.isArray(imagesLayouts)) {
                newLayout.push(...imagesLayouts);
              }
            } catch (e) {
              console.error("Erreur parsing Images multiples", e);
            }
          }

          setLayout(newLayout);
          loadedConfigId.current = configCurrent;
        }
      }
    } else if (configCurrent === null) {
      setLayout([]);
      loadedConfigId.current = null;
    }
  }, [configCurrent, configs]);

  const SaveLayoutBD = useCallback(
    (nouveauLayout: any) => {
      if (!configCurrent) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        const currentConfig = configs.find((c) => c.id === configCurrent);
        if (!currentConfig) return;

        const updatedConfig: Configuration = { ...currentConfig };

        WIDGETS_SINGLETONS.forEach((widgetName) => {
          const item = nouveauLayout.find((l: any) => l.i === widgetName);
          let layoutStr: string | null = null;
          if (item) {
            layoutStr = JSON.stringify({
              x: item.x || 0,
              y: item.y || 0,
              w: item.w || 4,
              h: item.h || 4,
            });
          }
          switch (widgetName) {
            case "Taches":
              updatedConfig.taches = layoutStr as any;
              break;
            case "Notes":
              updatedConfig.notes = layoutStr as any;
              break;
            case "Achats":
              updatedConfig.achats = layoutStr as any;
              break;
            case "Prets":
              updatedConfig.prets = layoutStr as any;
              break;
            case "Mouvements":
              updatedConfig.mouvements = layoutStr as any;
              break;
            case "Equipe":
              updatedConfig.equipe = layoutStr as any;
              break;
          }
        });
        const imagesWidgets = nouveauLayout
          .filter((item: any) => item.i.startsWith("Image-"))
          .map((item: any) => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          }));

        updatedConfig.images =
          imagesWidgets.length > 0
            ? JSON.stringify(imagesWidgets)
            : (null as any);

        try {
          const updated = await UpdateConfig(updatedConfig);
          if (updated && typeof updated === "object" && updated.id) {
            setConfigs((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c)),
            );
          }
        } catch (erreur) {
          console.error("Erreur sauvegarde", erreur);
        }
      }, 500);
    },
    [configCurrent, configs, UpdateConfig],
  );

  const handleAddWidget = (widgetName: string, isMultiple = false) => {
    const cols = 24;
    const maxRows = 24;
    const widgetW = 4;
    const widgetH = 4;

    const hasCollision = (x: number, y: number) =>
      layout.some((item) => {
        const noOverlap =
          x + widgetW <= item.x ||
          x >= item.x + item.w ||
          y + widgetH <= item.y ||
          y >= item.y + item.h;
        return !noOverlap;
      });

    let foundPosition: { x: number; y: number } | null = null;
    for (let y = 0; y <= maxRows - widgetH; y += widgetH) {
      for (let x = 0; x <= cols - widgetW; x += widgetW) {
        if (!hasCollision(x, y)) {
          foundPosition = { x, y };
          break;
        }
      }
      if (foundPosition) break;
    }

    if (!foundPosition) {
      setErreur("Plus de place disponible pour ajouter un widget.");
      return;
    }

    setErreur("");

    const finalId = isMultiple ? `${widgetName}-${Date.now()}` : widgetName;

    const newItem = {
      i: finalId,
      x: foundPosition.x,
      y: foundPosition.y,
      w: widgetW,
      h: widgetH,
    };

    const newLayout = [...layout, newItem];
    setLayout(newLayout);
    SaveLayoutBD(newLayout);
  };

  const handleLayoutCommit = useCallback(
    (layoutActuel: any) => {
      toggleGridInteractionClass(false);
      setLayout(layoutActuel);
      SaveLayoutBD(layoutActuel);
    },
    [SaveLayoutBD, toggleGridInteractionClass],
  );



  const RefreshConfig = async () => {
    if (context?.groupeActifId) {
      setErreur("");
      const resultatConfig: Configuration[] = await GetConfig();
      if (resultatConfig.length === 0) {
        setConfigCurrent(null);
        setConfigs([]);
      } else {
        setConfigCurrent((prev) =>
          prev && resultatConfig.some((c) => c.id === prev)
            ? prev
            : resultatConfig[0].id,
        );
        setConfigs(resultatConfig);
      }
    }
  };

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setLayout((prevLayout) => {
      const newLayout = prevLayout.filter((item) => item.i !== widgetId);
      SaveLayoutBD(newLayout);
      return newLayout;
    });
  }, [SaveLayoutBD]);

  const widgetTaches = useMemo(() => <WidgetTaches onClose={() => handleRemoveWidget("Taches")} isGuest={isGuest} isInteracting={isInteracting} />, [isGuest, handleRemoveWidget, isInteracting]);
  const widgetNotes = useMemo(() => <WidgetNotes onClose={() => handleRemoveWidget("Notes")} isGuest={isGuest} isInteracting={isInteracting} />, [isGuest, handleRemoveWidget, isInteracting]);
  const widgetAchats = useMemo(() => <WidgetAchats onClose={() => handleRemoveWidget("Achats")} isGuest={isGuest} isInteracting={isInteracting} />, [isGuest, handleRemoveWidget, isInteracting]);
  const widgetPrets = useMemo(() => <WidgetPrets onClose={() => handleRemoveWidget("Prets")} isGuest={isGuest} isInteracting={isInteracting} />, [isGuest, handleRemoveWidget, isInteracting]);
  const widgetMouvement = useMemo(() => <WidgetMouvements onClose={() => handleRemoveWidget("Mouvements")} isGuest={isGuest} isInteracting={isInteracting} />, [isGuest, handleRemoveWidget, isInteracting]);
  const widgetEquipe = useMemo(() => <WidgetEquipe onClose={() => handleRemoveWidget("Equipe")} isInteracting={isInteracting} />, [handleRemoveWidget, isInteracting]);

  useEffect(() => {
    RefreshConfig();
  }, [context?.groupeActifId, refreshVersion]);

  useEffect(() => {
    return () => toggleGridInteractionClass(false);
  }, [toggleGridInteractionClass]);

  useEffect(() => {
    setErreur("");
    const fetchUser = async () => {
      if (context?.groupeActifId) {
        const resultatUser: User[] = await GetUsersByRole(
          Number(context.groupeActifId),
          ROLE_ADMIN,
        );
        if (resultatUser.length === 0) {
          setErreur(
            "Mode Urgence activé. Il n'y a aucun Admin dans le groupe. Veuillez en mettre un !",
          );
        }
        const resultatUserGuest: User[] = await GetUsersByRole(
          Number(context.groupeActifId),
          ROLE_INVITE,
        );
        setIsGuest(
          resultatUserGuest.find((u) => u.id === context.auth.idUser) !==
            undefined,
        );
      }
    };
    fetchUser();
  }, [context?.groupeActifId, refreshVersion]);

  useEffect(() => {
    if (!context?.groupeActifId || context.auth.idUser == null) return;
    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),

      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_MEMBRES")
            setRefreshVersion((prev) => prev + 1);
        });
      },
    });
    const activationTimer = window.setTimeout(
      () => stompClient.activate(),
      400,
    );
    return () => {
      window.clearTimeout(activationTimer);
      if (stompClient.active) void stompClient.deactivate();
    };
  }, [context?.groupeActifId, context?.auth.idUser]);

  async function handleRemoveUser(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) return;
    try {
      setErreur("");
      await RemoveUser(context.groupeActifId, String(userId));
      setRefreshVersion((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur lors de la suppression", error);
      setErreur("Impossible de quitter le groupe. Vérifie ta session.");
    }
  }

  const handleCreateConfig = async () => {
    const config = await GetConfigAdmin();
    if (configs.length >= config.maxConfigurations) {
      setErreur("Nombre maximum de configurations atteint");
      setIsCreatingConfig(false);
      return;
    }
    if (newConfigName.trim()) {
      setErreur("");
      await CreateConfig(newConfigName.trim());
      await RefreshConfig();
    }
    setNewConfigName("");
    setIsCreatingConfig(false);
  };

  const handleDeleteConfig = async (idConfig: number) => {
    await DeleteConfig(idConfig);
    await RefreshConfig();
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-sm text-slate-700 bg-transparent">
      {context?.auth.idUser != null && (
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => void handleRemoveUser(context.auth.idUser as number)}
          title="Quitter le groupe"
          message="Es-tu sûr de vouloir quitter le groupe ?"
        />
      )}

      <ConfirmModal
        isOpen={configToDelete !== null}
        onClose={() => setConfigToDelete(null)}
        onConfirm={() => {
          if (configToDelete !== null) {
            void (async () => {
              try {
                await handleDeleteConfig(configToDelete);
              } catch (err) {
                console.error("Erreur suppression config", err);
              }
              setConfigToDelete(null);
            })();
          }
        }}
        title="Supprimer la configuration"
        message="Es-tu sûr de vouloir supprimer cette configuration ?"
      />

      <div className="flex-1 min-h-0">
        <main
          className="h-full overflow-y-scroll overflow-x-hidden relative p-8"
          id="widget-desktop"
        >
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <SelectGroupe key={`select-${refreshVersion}`} />
            {isGuest && (
              <p className="inline-flex bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-1 text-xs font-medium">
                Invité
              </p>
            )}
            {!isGuest && (
              <p className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-1 text-xs font-medium">
                Membre
              </p>
            )}
            <div className="flex items-center gap-2">
              <ButtonAdminGroupe key={`admin-${refreshVersion}`} />
              {context?.isLogged && (
                <Link
                  to="/add-group"
                  className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ajouter un groupe"
                >
                  <SquarePlus size={20} />
                </Link>
              )}
              {context?.auth.idUser != null && (
                <button
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => setIsModalOpen(true)}
                  title="Quitter le groupe"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
            {erreur && (
              <div className="w-full text-center px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-medium mt-2">
                {erreur}
              </div>
            )}
          </div>

          <ReactGridLayout
            className="layout"
            layout={layout}
            cols={24}
            rowHeight={60}
            onDragStart={() => toggleGridInteractionClass(true)}
            onResizeStart={() => toggleGridInteractionClass(true)}
            onDragStop={(layoutActuel: any) => handleLayoutCommit(layoutActuel)}
            onResizeStop={(layoutActuel: any) =>
              handleLayoutCommit(layoutActuel)
            }
            draggableHandle=".drag-handle"
            margin={[16, 16]}
            maxRows={24}
            compactType={null}
            preventCollision={true}
          >
            {layout.map((item) => (
              <div key={item.i}>
                {item.i === "Taches" && widgetTaches}
                {item.i === "Notes" && widgetNotes}
                {item.i === "Achats" && widgetAchats}
                {item.i === "Prets" && widgetPrets}
                {item.i === "Mouvements" && widgetMouvement}
                {item.i === "Equipe" && widgetEquipe}
                {item.i.startsWith("Image-") && (
                  <WidgetImages
                    widgetId={item.i}
                    onClose={() => handleRemoveWidget(item.i)}
                    isGuest={isGuest}
                    isInteracting={isInteracting}
                  />
                )} 
              </div>
            ))}
          </ReactGridLayout>

          <div
            className={`fixed top-0 right-0 h-full bg-white shadow-[-4px_0_15px_rgba(15,23,42,0.08)] border-l border-slate-100 transition-transform duration-300 z-100 ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ width: "250px" }}
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 text-slate-800">
              <h3 className="font-bold">Ajouter un Widget</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-60px)]">
              {availableWidgets.map((widget) => (
                <div
                  key={widget}
                  onClick={() => handleAddWidget(widget, false)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-md shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md hover:bg-green-50 transition-all flex items-center justify-between group"
                >
                  <span className="font-medium text-slate-700 group-hover:text-green-700">
                    {widget}
                  </span>
                  <button className="text-slate-400 group-hover:text-green-600 bg-white p-1 rounded-full shadow-sm">
                    <Plus size={16} />
                  </button>
                </div>
              ))}

              <div className="pt-4 pb-2 border-t border-slate-100 mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Multiples
                </p>
              </div>

              <div
                onClick={() => handleAddWidget("Image", true)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-md shadow-sm cursor-pointer hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50 transition-all flex items-center justify-between group"
              >
                <span className="font-medium text-slate-700 group-hover:text-indigo-700">
                  Galerie Image
                </span>
                <button className="text-slate-400 group-hover:text-indigo-600 bg-white p-1 rounded-full shadow-sm">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {configs.length > 0 && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`fixed bottom-16 right-8 p-4 rounded-2xl shadow-xl text-white transition-all duration-300 hover:-translate-y-1 z-110 ${
                isSidebarOpen
                  ? "bg-rose-500 hover:bg-rose-600 rotate-45"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200/50"
              }`}
              title="Ajouter un widget"
            >
              <SquarePlus size={24} />
            </button>
          )}
        </main>
      </div>

      <footer className="h-11 bg-slate-50 border-t border-slate-100 flex items-end px-2 shrink-0 gap-1 overflow-x-auto select-none relative z-50">
        {configs.map((config) => (
          <div
            key={config.id}
            onClick={() => {
              setConfigCurrent(config.id);
              setErreur("");
            }}
            className={`px-5 rounded-t-xl shadow-sm border border-emerald-200/50 border-b-0 flex items-center gap-2 cursor-pointer transition-all duration-200 ${
              configCurrent === config.id
                ? "bg-white border-t-2 border-emerald-600 py-2 font-bold text-emerald-900 -translate-y-1"
                : "bg-emerald-50/50 py-1.5 text-emerald-700 hover:bg-white font-medium backdrop-blur-sm"
            }`}
          >
            <span>{config.nom}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfigToDelete(config.id);
              }}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Supprimer la configuration"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {isCreatingConfig ? (
          <input
            autoFocus
            type="text"
            className="px-3 py-1 text-slate-800 bg-white rounded-t-lg font-semibold ml-1 outline-none border border-t-2 border-blue-500 w-32 mb-px"
            value={newConfigName}
            onChange={(e) => setNewConfigName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreateConfig();
              else if (e.key === "Escape") {
                setIsCreatingConfig(false);
                setErreur("");
                setNewConfigName("");
              }
            }}
            onBlur={() => void handleCreateConfig()}
            placeholder="Nom..."
          />
        ) : (
          <button
            onClick={() => setIsCreatingConfig(true)}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-lg font-bold ml-1"
          >
            +
          </button>
        )}
      </footer>
    </div>
  );
}


