import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import SelectGroupe from "../components/SelectGroupe";
import { ButtonAdminGroupe } from "../components/ButtonAdminGroupe";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { LogOut, SquarePlus } from "lucide-react";
import ConfirmModal from "../components/ConfirmeModalProps";
import {
  ROLE_ADMIN,
  useCreateConfiguration,
  useDeleteConfiguration,
  useGetConfiguration,
  useGetUsersByRoleGroupe,
  useRemoveUserByGroupe,
  useUpdateConfiguration,
} from "../services/membreService";
import type { User } from "../types/User";
import { Link } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import WidgetTaches from "../components/Widgets/WidgetTache";
import WidgetNotes from "../components/Widgets/WidgetNotes";
import WidgetAchats from "../components/Widgets/WidgetAchats";
import WidgetPrets from "../components/Widgets/WidgetPrets";
import WidgetMouvements from "../components/Widgets/WidgetMouvement";
import type { Configuration } from "../types/Configuration";

const ResponsiveGridLayout = WidthProvider(Responsive);
export default function DashboardPage() {
  const context = useContext(AuthContext);
  const GetUsersByRole = useGetUsersByRoleGroupe();
  const GetConfig = useGetConfiguration();
  const UpdateConfig = useUpdateConfiguration();
  const DeleteConfig = useDeleteConfiguration();
  const CreateConfig = useCreateConfiguration();

  const Widgets : string[] = ["Taches", "Notes", "Achats", "Prets", "Mouvements", "Image1"];
  const [configCurrent, setConfigCurrent] = useState<number | null>(null);
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [erreur, setErreur] = useState("");
  const [userAdmin, setUserAdmin] = useState<User[]>([]);
  const RemoveUser = useRemoveUserByGroupe();

  const [layout, setLayout] = useState<any[]>([]);
  const SaveLayoutBD = async (nouveauLayout: any) => {
    try {
      await UpdateConfig(nouveauLayout); 
      console.log("Configuration sauvegardée en base de données !");
    } catch (erreur) {
      console.error("Erreur lors de la sauvegarde du layout :", erreur);
    }
  };

  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      if (context?.groupeActifId) {
        const resultatConfig: Configuration[] = await GetConfig();
        if (resultatConfig.length === 0) {
          setConfigCurrent(null);
          setConfigs([]);
        } else {
          setConfigCurrent(resultatConfig[0].id);
          setConfigs(resultatConfig);
        }
      }
    };
    fetchConfig();
  }, [context?.groupeActifId]);

  useEffect(() => {
    setErreur("");
    const fetchUser = async () => {
      if (context?.groupeActifId) {
        const resultatUser: User[] = await GetUsersByRole(
          Number(context.groupeActifId),
          ROLE_ADMIN,
        );
        setUserAdmin(resultatUser);
        if (resultatUser.length === 0) {
          setErreur(
            "Mode Urgence activé. Il n'y a aucun Admin dans le groupe. Veuillez en mettre un !",
          );
        }
      }
    };
    fetchUser();
  }, [context?.groupeActifId]);

  useEffect(() => {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

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

    return () => {
      void stompClient.deactivate();
    };
  }, [context?.groupeActifId, context?.auth.idUser]);

  async function handleRemoveUser(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    try {
      setErreur("");
      await RemoveUser(context.groupeActifId, String(userId));
      setRefreshVersion((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur lors de la suppression du membre", error);
      setErreur("Impossible de quitter le groupe. Vérifie ta session.");
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden text-sm">
      <header className="flex items-center gap-3 p-3 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
        <SelectGroupe key={`select-${refreshVersion}`} />
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
              onConfirm={() =>
                void handleRemoveUser(context.auth.idUser as number)
              }
              title="Quitter le groupe"
              message="Es-tu sûr de vouloir quitter le groupe ?"
            />
          </>
        )}
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

    <main className="flex-1 overflow-auto relative p-4 bg-slate-100" id="widget-desktop">      
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }} 
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 24, md: 10, sm: 6, xs: 4, xxs: 2 }} 
        rowHeight={60} 
        onLayoutChange={onLayoutChange}
        onDragStop={(layoutActuel) => SaveLayoutBD(layoutActuel)}
        onResizeStop={(layoutActuel) => SaveLayoutBD(layoutActuel)}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
        compactType={null}
        preventCollision={true}
        maxRows={22}
      >

        {layout && (layout.map((item) => (
          <div key={item.i}>
            {item.i === "Taches" && <WidgetTaches />}
            {item.i === "Notes" && <WidgetNotes />}
            {item.i === "Achats" && <WidgetAchats />}
            {item.i === "Prets" && <WidgetPrets />}
            {item.i === "Mouvements" && <WidgetMouvements />}
          </div>
        )))}

      </ResponsiveGridLayout>

    </main>

      <footer className="h-10 bg-gray-200 border-t border-gray-300 flex items-end px-2 shrink-0 gap-1 overflow-x-auto select-none">
        {configs.map((config) => (
          <div className="bg-white border-t-2 border-green-600 px-4 py-1.5 rounded-t-sm shadow-sm cursor-default flex items-center gap-2">
            <span className="font-semibold text-gray-800">{config.nom}</span>
          </div>
        ))}
        <button className="px-3 py-1.5 text-gray-600 hover:text-black hover:bg-gray-300 rounded-t-sm font-bold ml-1">
          +
        </button>
      </footer>
    </div>
  );
}