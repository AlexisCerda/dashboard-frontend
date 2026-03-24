import { useEffect, useState } from "react";
import WidgetFrame from "../WidgetFrame";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { MembreDTO } from "../../services/userService";


export default function WidgetEquipe({ onClose }: { onClose?: () => void; isGuest?: boolean }) {
  const [membres, setMembres] = useState<MembreDTO[]>([]);
  const [admins , setAdmins] = useState<MembreDTO[]>([]);
  const [guests, setGuests] = useState<MembreDTO[]>([]);
  const context = useContext(AuthContext);

  useEffect(() => {
    if (!context?.auth.idUser) return;

    const frequence = `/topic/membre/${context.auth.idUser}`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),

      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(frequence, (message) => {
          if (message.body === "REFRESH_MEMBRES") { 
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
      
    } catch (error) {
      console.error("Erreur", error);
    }
  }
  
  return (
    <WidgetFrame
      title="Mes Notes Personnelles"
      headerColor="bg-orange-500 text-white border-b border-orange-600"
      onClose={onClose}
    >
      <></>
    </WidgetFrame>
  );
}
