import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import SelectGroupe from "../components/SelectGroupe";
import { ButtonAdminGroupe } from "../components/ButtonAdminGroupe";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function DashboardPage() {
  const context = useContext(AuthContext);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    const frequence = `/topic/groupe/${context.groupeActifId}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (
            message.body === "REFRESH_MEMBRES"
          ) {
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

  console.log(context?.groupeActifId);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mon Tableau de Bord</h1>

      <p className="mb-4 text-gray-600">
        Affichage des données pour le groupe ID :
        <span className="font-bold text-blue-600">
          {" "}
          {context?.groupeActifId}
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectGroupe key={`select-${refreshVersion}`} />
        <ButtonAdminGroupe key={`admin-${refreshVersion}`} />
      </div>
    </div>
  );
}

