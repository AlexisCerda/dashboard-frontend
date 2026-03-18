import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import SelectGroupe from "../components/SelectGroupe";
import { ButtonAdminGroupe } from "../components/ButtonAdminGroupe";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { LogOut, SquarePlus, X, Plus } from "lucide-react"; // Ajout de l'icône Plus
import ConfirmModal from "../components/ConfirmeModalProps";
import {
  ROLE_ADMIN,
  ROLE_INVITE,
  useCreateConfiguration,
  useDeleteConfiguration,
  useGetConfig,
  useGetConfiguration,
  useGetUsersByRoleGroupe,
  useRemoveUserByGroupe,
  useUpdateConfiguration,
} from "../services/membreService";
import type { User } from "../types/User";
import { Link } from "react-router-dom";

import RGL, { WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import WidgetTaches from "../components/Widgets/WidgetTache";
import WidgetNotes from "../components/Widgets/WidgetNotes";
import WidgetAchats from "../components/Widgets/WidgetAchats";
import WidgetPrets from "../components/Widgets/WidgetPrets";
import WidgetMouvements from "../components/Widgets/WidgetMouvement";
import type { Configuration } from "../types/Configuration";

const ReactGridLayout = WidthProvider(RGL);

const WIDGETS: string[] = [
  "Taches",
  "Notes",
  "Achats",
  "Prets",
  "Mouvements",
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
  const [userAdmin, setUserAdmin] = useState<User[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const [layout, setLayout] = useState<any[]>([]);
  const loadedConfigId = useRef<number | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableWidgets = WIDGETS.filter(
    (widgetName) => !layout.some((item) => item.i === widgetName)
  );

  
  useEffect(() => {
    if (configCurrent !== null && configs.length > 0) {
      if (loadedConfigId.current !== configCurrent) {
        const currentConfig = configs.find((c) => c.id === configCurrent);
        
        if (currentConfig) {
          const newLayout: any[] = [];
          
          const parseWidget = (id: string, dataStr: any) => {
            if (dataStr && typeof dataStr === "string" && dataStr !== "null" && dataStr.trim() !== "") {
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

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const currentConfig = configs.find((c) => c.id === configCurrent);
        if (!currentConfig) return;

        const updatedConfig: Configuration = { ...currentConfig };

        WIDGETS.forEach((widgetName) => {
          const item = nouveauLayout.find((l: any) => l.i === widgetName);
          let layoutStr: string | null = null; 
          
          if (item) {
            const layoutData = {
              x: item.x || 0,
              y: item.y || 0,
              w: item.w || 4,
              h: item.h || 4,
            };
            layoutStr = JSON.stringify(layoutData);
          }

          switch (widgetName) {
            case "Taches": updatedConfig.taches = layoutStr as any; break;
            case "Notes": updatedConfig.notes = layoutStr as any; break;
            case "Achats": updatedConfig.achats = layoutStr as any; break;
            case "Prets": updatedConfig.prets = layoutStr as any; break;
            case "Mouvements": updatedConfig.mouvements = layoutStr as any; break;
          }
        });

        try {
          const updated = await UpdateConfig(updatedConfig);
          if (updated && typeof updated === "object" && updated.id) {
            setConfigs((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
          }
        } catch (erreur) {
          console.error("Erreur sauvegarde", erreur);
        }
      }, 500);
    },
    [configCurrent, configs, UpdateConfig]
  );

  const handleAddWidget = (widgetName: string) => {
    let nextX = 0;
    layout.forEach((w) => {
      if (w.y === 0 && w.x + w.w > nextX) {
        nextX = w.x + w.w;
      }
    });

    if (nextX + 4 > 24) {
      nextX = 0;
    }
    
    const newItem = { i: widgetName, x: nextX, y: 0, w: 4, h: 4 };
    
    const newLayout = [...layout, newItem];
    
    setLayout(newLayout);
    SaveLayoutBD(newLayout);
  };

  const onLayoutChange = useCallback((newLayout: any) => {
    setLayout(newLayout);
  }, []);

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
            : resultatConfig[0].id
        );
        setConfigs(resultatConfig);
      }
    }
  };

  const handleRemoveWidget = (widgetName: string) => {
    setLayout((prevLayout) => {
      const newLayout = prevLayout.filter((item) => item.i !== widgetName);
      SaveLayoutBD(newLayout); 
      return newLayout;
    });
  };

  useEffect(() => {
    RefreshConfig();
  }, [context?.groupeActifId, refreshVersion]);

  useEffect(() => {
    setErreur("");
    const fetchUser = async () => {
      if (context?.groupeActifId) {
        const resultatUser: User[] = await GetUsersByRole(
          Number(context.groupeActifId),
          ROLE_ADMIN
        );
        setUserAdmin(resultatUser);
        if (resultatUser.length === 0) {
          setErreur("Mode Urgence activé. Il n'y a aucun Admin dans le groupe. Veuillez en mettre un !");
        }
        const resultatUserGuest: User[] = await GetUsersByRole(
          Number(context.groupeActifId),
          ROLE_INVITE
        );
        setIsGuest(resultatUserGuest.find((u) => u.id === context.auth.idUser) !== undefined);
      }
    };
    fetchUser();
  }, [context?.groupeActifId, refreshVersion]);

  useEffect(() => {
    if (!context?.groupeActifId || context.auth.idUser == null) return;

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_MEMBRES") {
            setRefreshVersion((prev) => prev + 1);
          }
        });
      },
    });

    stompClient.activate();
    return () => { void stompClient.deactivate(); };
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
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden text-sm">
      <header className="flex items-center gap-3 p-3 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
        <SelectGroupe key={`select-${refreshVersion}`} />
        {isGuest && <p>Invité</p>}
        {!isGuest && <p>Membre</p>}
        <ButtonAdminGroupe key={`admin-${refreshVersion}`} />

        {context?.auth.idUser != null && (
          <>
            <button
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              onClick={() => setIsModalOpen(true)}
              title="Quitter le groupe"
            >
              <LogOut size={20} />
            </button>
            <ConfirmModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={() => void handleRemoveUser(context.auth.idUser as number)}
              title="Quitter le groupe"
              message="Es-tu sûr de vouloir quitter le groupe ?"
            />
          </>
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

        <div>
          {context?.isLogged && (
            <Link
              to="/add-group"
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors 2xl:border-t-8"
            >
              <SquarePlus />
            </Link>
          )}
        </div>

        {erreur && (
          <div className="ml-auto px-4 py-1 bg-red-100 text-red-700 rounded-md border border-red-200 font-medium">
            {erreur}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-scroll overflow-x-hidden relative p-4 bg-slate-100" id="widget-desktop">
        <ReactGridLayout
          className="layout"
          layout={layout}
          cols={24}
          rowHeight={60}
          onLayoutChange={onLayoutChange}
          onDragStop={(layoutActuel: any) => SaveLayoutBD(layoutActuel)}
          onResizeStop={(layoutActuel: any) => SaveLayoutBD(layoutActuel)}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
          maxRows={24}
          compactType={null}
          preventCollision={true}
        >
          {layout.map((item) => (
            <div key={item.i}>
              {item.i === "Taches" && <WidgetTaches onClose={() => handleRemoveWidget("Taches")} isGuest={isGuest} />}
              {item.i === "Notes" && <WidgetNotes onClose={() => handleRemoveWidget("Notes")} isGuest={isGuest} />}
              {item.i === "Achats" && <WidgetAchats onClose={() => handleRemoveWidget("Achats")} isGuest={isGuest} />}
              {item.i === "Prets" && <WidgetPrets onClose={() => handleRemoveWidget("Prets")} isGuest={isGuest} />}
              {item.i === "Mouvements" && <WidgetMouvements onClose={() => handleRemoveWidget("Mouvements")} isGuest={isGuest} />}
            </div>
          ))}
        </ReactGridLayout>

        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.1)] border-l border-gray-200 transition-transform duration-300 z-[100] ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ width: "250px" }}
        >
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-800 text-white">
            <h3 className="font-bold">Ajouter un Widget</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="hover:text-red-400">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-60px)]">
            {availableWidgets.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                Tous les widgets sont déjà sur le bureau !
              </p>
            ) : (
              availableWidgets.map((widget) => (
                <div
                  key={widget}
                  onClick={() => handleAddWidget(widget)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-md shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md hover:bg-green-50 transition-all flex items-center justify-between group"
                >
                  <span className="font-medium text-slate-700 group-hover:text-green-700">{widget}</span>
                  <button className="text-slate-400 group-hover:text-green-600 bg-white p-1 rounded-full shadow-sm">
                    <Plus size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {configs.length > 0 && (<button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed bottom-16 right-6 p-3 rounded-full shadow-lg text-white transition-all z-[110] ${
            isSidebarOpen
              ? "bg-red-500 hover:bg-red-600 rotate-45"
              : "bg-green-600 hover:bg-green-700"
          }`}
          title="Ajouter un widget"
        >
          <SquarePlus size={24} />
        </button>)}
      </main>

      <footer className="h-10 bg-gray-200 border-t border-gray-300 flex items-end px-2 shrink-0 gap-1 overflow-x-auto select-none relative z-50">
        {configs.map((config) => (
          <div
            key={config.id}
            onClick={() => {
              setConfigCurrent(config.id);
              setErreur("");
            }}
            className={`px-4 rounded-t-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all ${
              configCurrent === config.id
                ? "bg-white border-t-2 border-green-600 py-1.5 font-semibold text-gray-800"
                : "bg-gray-300 py-1 text-gray-600 hover:bg-gray-100 font-medium"
            }`}
          >
            <span>{config.nom}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfigToDelete(config.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
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
            className="px-3 py-1 text-gray-800 bg-white rounded-t-sm font-semibold ml-1 outline-none border-t-2 border-blue-500 w-32 mb-[1px]"
            value={newConfigName}
            onChange={(e) => setNewConfigName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleCreateConfig();
              } else if (e.key === "Escape") {
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
            className="px-3 py-1.5 text-gray-600 hover:text-black hover:bg-gray-300 rounded-t-sm font-bold ml-1"
          >
            +
          </button>
        )}
      </footer>
    </div>
  );
}