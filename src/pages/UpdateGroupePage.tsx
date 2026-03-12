import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useAddUserByGroupe, useGetAdminUserByGroupe, useGetAllUser, useGetUserByGroupe, useRemoveUserByGroupe, useUpdateAdminToMembre, useUpdateMembreToAdmin } from "../services/membreService";
import type { User } from "../types/User";
import { ChevronsDown, ChevronsUp, CirclePlus, LogOut, User as UserIcon, UserPlus, UserStar } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNavigate } from "react-router-dom";

export function UpdateGroupePage(){
  const navigate = useNavigate();
  const GetUserByGroupe = useGetUserByGroupe();
  const context = useContext(AuthContext);
  const GetAllUser = useGetAllUser();
  const AddUser = useAddUserByGroupe();
  const RemoveUser = useRemoveUserByGroupe();
  const GetUserAdmin = useGetAdminUserByGroupe();
  const UpdateUsertoAdmin = useUpdateMembreToAdmin();
  const UpdateAdmintoUser = useUpdateAdminToMembre();

  const [currentuser, setCurrentuser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [userAdmin, setUserAdmin] = useState<User[]>([]);
  const [alluser, setAllUser] = useState<User[]>([]);
  const [verifAddUser, setVerifAddUser] = useState(false);

  async function refreshGroupData() {
    if (!context?.groupeActifId) {
      return null;
    }

    const groupId = Number(context.groupeActifId);
    const [resultatUser, resultatAdmin] = await Promise.all([
      GetUserByGroupe(groupId),
      GetUserAdmin(groupId),
    ]);

    setUsers(resultatUser);
    setUserAdmin(resultatAdmin);

    return { resultatUser, resultatAdmin };
  }

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
            void (async () => {
              const groupData = await refreshGroupData();
              if (!groupData) {
                return;
              }

              const isCurrentUserStillAdmin = groupData.resultatAdmin.some(
                (admin: User) => admin.id === context.auth.idUser
              );

              if (!isCurrentUserStillAdmin) {
                navigate("/dashboard");
              }
            })();
          }
        });
      },
    });

    stompClient.activate();

    return () => {
      void stompClient.deactivate();
    };
  }, [context?.groupeActifId, context?.auth.idUser, navigate]);

  useEffect(() => {
        const fetchUser = async () => {
          if (context?.groupeActifId) {
            const resultatUser: User[] = await GetUserByGroupe(Number(context.groupeActifId));
            setUsers(resultatUser);
          }};
        fetchUser();
  }, [context?.groupeActifId]);

  useEffect(() => {
        const fetchUser = async () => {
          if (context?.groupeActifId) {
            const resultatUser: User[] = await GetAllUser();
            setAllUser(resultatUser);
          }};
        fetchUser();
  }, [context?.groupeActifId]);

  useEffect(() => {
        const fetchUser = async () => {
          if (context?.groupeActifId) {
            const resultatUser: User[] = await GetUserAdmin(Number(context.groupeActifId));
            setUserAdmin(resultatUser);
          }};
        fetchUser();
  }, [context?.groupeActifId]);


  useEffect(() => {
    setCurrentuser(users.find((user) => user.id === context?.auth.idUser));
  }, [users, context?.auth.idUser]);

  const availableUsers = alluser
    .filter((user) => !users.some((u) => u.id === user.id));

  const uniqueUsers = users
    .filter((user, index, array) => array.findIndex((u) => u.id === user.id) === index);

  function HandleAddUser(){
    setVerifAddUser((prev) => !prev);
  }

  async function HandlePromoteUser(userId: number){
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }
    await UpdateUsertoAdmin(context.groupeActifId, String(userId), String(context.auth.idUser));
    await refreshGroupData();
  }

  async function HandleDemoteUser(userId: number){
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }
    await UpdateAdmintoUser(context.groupeActifId, String(userId), String(context.auth.idUser));
    await refreshGroupData();
  }

  async function handleAddMember(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    await AddUser(context.groupeActifId, String(userId), String(context.auth.idUser));
    await refreshGroupData();
  }

  async function handleRemoveUser(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    await RemoveUser(context.groupeActifId, String(userId));
    await refreshGroupData();
  }
  return <>
    <div>
      <ul>
        {uniqueUsers.map((user: User) => (
          <li key={user.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }} className="m-5">
              {user.nom} {user.prenom} {user.id === currentuser?.id && <><UserIcon/><UserStar/></>}
              {userAdmin.filter((e) => e.id != currentuser?.id).some((admin) => admin.id === user.id) ? <><UserStar/> <button onClick={() => void HandleDemoteUser(user.id)}> <ChevronsDown/> </button></> :
                user.id !== currentuser?.id &&  <button type="button" onClick={() => void HandlePromoteUser(user.id)}><ChevronsUp /></button>}
              {user.id !== currentuser?.id && <button onClick={() => void handleRemoveUser(user.id)}><LogOut/></button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
    <div>
      <button onClick={HandleAddUser} className="m-5"> <UserPlus /> </button>
    </div>
    {verifAddUser && <div>
      {availableUsers.map((user: User) => (
          <li key={user.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }} className="m-5">
              {user.nom} {user.prenom} <button type="button" onClick={() => void handleAddMember(user.id)}><CirclePlus/></button>
            </div>
          </li>
        ))}
      </div>}

  </>;
}