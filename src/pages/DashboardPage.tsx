import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import SelectGroupe from "../components/SelectGroupe";
import { ButtonAdminGroupe } from "../components/ButtonAdminGroupe";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { LogOut } from "lucide-react";
import ConfirmModal from "../components/ConfirmeModalProps";
import { useGetAdminUserByGroupe, useRemoveUserByGroupe } from "../services/membreService";
import type { User } from "../types/User";

export default function DashboardPage() {
  const context = useContext(AuthContext);
  const GetUserAdmin = useGetAdminUserByGroupe();

  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [erreur, setErreur] = useState("");
  const [userAdmin, setUserAdmin] = useState<User[]>([]);
  const RemoveUser = useRemoveUserByGroupe();

  useEffect(() => {
    setErreur("");
    const fetchUser = async () => {
      if (context?.groupeActifId) {
        const resultatUser: User[] = await GetUserAdmin(
          Number(context.groupeActifId),
        );
        setUserAdmin(resultatUser);
        if (resultatUser.length === 0) {
          setErreur("Mode Urgence activé. Il n'y a aucun Admin dans le groupe. Veuillez en mettre un !");
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mon Tableau de Bord</h1>

      {erreur && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
          {erreur}
        </div>
      )}

      <p className="mb-4 text-gray-600">
        Affichage des données pour le groupe ID :
        <span className="font-bold text-blue-600">
          {" "}
          {context?.groupeActifId}
        </span>
      </p>

      <div className="flex gap-4">
        <SelectGroupe key={`select-${refreshVersion}`} />
        <ButtonAdminGroupe key={`admin-${refreshVersion}`} />
        {context?.auth.idUser != null && (
          <>
            <button className="m-5" onClick={() => setIsModalOpen(true)}>
              <LogOut />
            </button>
            <ConfirmModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={() => {
                void handleRemoveUser(context.auth.idUser as number);
              }}
              title="Qutter le groupe"
              message="Es-tu sûr de vouloir quitter le groupe ?"
            />
          </>
        )}
      </div>
    </div>
  );
}
