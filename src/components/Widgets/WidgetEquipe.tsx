import { useEffect, useState, useContext, memo, useCallback } from "react";
import WidgetFrame from "../WidgetFrame";
import { AuthContext } from "../../context/AuthContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { MembreDTO } from "../../services/userService";
import {
  ROLE_ADMIN,
  ROLE_INVITE,
  ROLE_MEMBRE,
} from "../../services/apiConfig";
import { useGetUsersByRoleGroupe } from "../../services/groupeService";
import { ShieldCheck, Users, UserPlus } from "lucide-react";

const WidgetEquipe = memo(function WidgetEquipe({
  onClose,
  isInteracting = false,
}: {
  onClose?: () => void;
  isGuest?: boolean;
  isInteracting?: boolean;
}) {
  const [membres, setMembres] = useState<MembreDTO[]>([]);
  const [admins, setAdmins] = useState<MembreDTO[]>([]);
  const [guests, setGuests] = useState<MembreDTO[]>([]);
  const context = useContext(AuthContext);

  const getUserGuest = useGetUsersByRoleGroupe();

  const refreshData = useCallback(async () => {
    if (!context?.auth.idUser) return;
    try {
      const [adminsData, memberData, guestsData] = await Promise.all([
        getUserGuest(Number(context.groupeActifId), ROLE_ADMIN),
        getUserGuest(Number(context.groupeActifId), ROLE_MEMBRE),
        getUserGuest(Number(context.groupeActifId), ROLE_INVITE),
      ]);
      setAdmins(adminsData);
      setMembres(memberData);
      setGuests(guestsData);
    } catch (error) {
      console.error("Erreur", error);
    }
  }, [context?.auth.idUser, context?.groupeActifId, getUserGuest]);

  useEffect(() => {
    if (!context?.auth.idUser) return;

    const frequence = `/topic/membre/${context.auth.idUser}`;
    const stompClient = new Client({
      webSocketFactory: () =>
        new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),
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
  }, [context?.auth.idUser, refreshData]);

  const MemberCard = ({
    member,
    icon,
    colorClass,
    bgColorClass,
    borderColorClass,
  }: {
    member: MembreDTO;
    icon: React.ReactNode;
    colorClass: string;
    bgColorClass: string;
    borderColorClass: string;
  }) => (
    <div
      className={`flex items-center gap-3 p-2.5 bg-white rounded-xl border ${borderColorClass} shadow-sm hover:shadow-md hover:translate-x-1 transition-all group`}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass} ${colorClass} font-bold text-sm shrink-0 border border-white shadow-inner`}
      >
        {member.prenom?.charAt(0).toUpperCase() ||
          member.nom?.charAt(0).toUpperCase() ||
          "?"}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-slate-800 truncate">
          {member.prenom}{" "}
          <span className="uppercase text-[10px] opacity-70">{member.nom}</span>
        </span>
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {icon}
          <span className="text-[10px] font-medium tracking-wider uppercase">
            {colorClass.includes("orange")
              ? "Admin"
              : colorClass.includes("blue")
                ? "Membre"
                : "Invité"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetFrame
      title="Équipe"
      headerColor="bg-indigo-600 text-white border-b border-indigo-700"
      onClose={onClose}
    >
      <div className="flex flex-col h-full overflow-y-auto p-3 space-y-6 custom-scrollbar">
        {isInteracting ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
            <p className="text-xs font-medium italic">
              Optimisation en cours...
            </p>
          </div>
        ) : (
          <>
            {admins.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <ShieldCheck className="text-indigo-500" size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Administrateurs
                  </h3>
                  <span className="ml-auto bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {admins.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {admins.map((admin) => (
                    <MemberCard
                      key={admin.id}
                      member={admin}
                      icon={<ShieldCheck size={10} />}
                      colorClass="text-indigo-600"
                      bgColorClass="bg-indigo-100"
                      borderColorClass="border-indigo-100"
                    />
                  ))}
                </div>
              </div>
            )}

            {membres.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Users className="text-blue-500" size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Membres
                  </h3>
                  <span className="ml-auto bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {membres.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {membres.map((membre) => (
                    <MemberCard
                      key={membre.id}
                      member={membre}
                      icon={<Users size={10} />}
                      colorClass="text-blue-600"
                      bgColorClass="bg-blue-100"
                      borderColorClass="border-blue-100"
                    />
                  ))}
                </div>
              </div>
            )}
            {guests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <UserPlus className="text-slate-400" size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Invités
                  </h3>
                  <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {guests.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {guests.map((guest) => (
                    <MemberCard
                      key={guest.id}
                      member={guest}
                      icon={<UserPlus size={10} />}
                      colorClass="text-slate-500"
                      bgColorClass="bg-slate-100"
                      borderColorClass="border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}
            {admins.length === 0 &&
              membres.length === 0 &&
              guests.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                  <Users size={48} className="opacity-20 mb-2" />
                  <p className="text-xs italic">
                    Aucun membre dans cette équipe
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </WidgetFrame>
  );
});

export default WidgetEquipe;
