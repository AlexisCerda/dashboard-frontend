import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  ROLE_ADMIN,
  ROLE_MEMBRE,
  useAddUserByGroupe,
  useGetUsersByRoleGroupe,
  useGetAllUser,
  useGetUserByGroupe,
  useRemoveUserByGroupe,
  useUpdateMembreRole,
  useUpdateMembreToAdminUrgent,
  ROLE_INVITE,
} from "../services/membreService";
import type { User } from "../types/User";
import {
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  CirclePlus,
  LogOut,
  User as UserIcon,
  UserPlus,
  UserStar,
} from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNavigate } from "react-router-dom";

export function UpdateGroupePage() {
  const navigate = useNavigate();
  const GetUserByGroupe = useGetUserByGroupe();
  const context = useContext(AuthContext);
  const GetAllUser = useGetAllUser();
  const AddUser = useAddUserByGroupe();
  const RemoveUser = useRemoveUserByGroupe();
  const GetUsersByRole = useGetUsersByRoleGroupe();
  const UpdateMembreRole = useUpdateMembreRole();
  const UpdateUsertoAdminUrgent = useUpdateMembreToAdminUrgent();

  const [currentuser, setCurrentuser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [userAdmin, setUserAdmin] = useState<User[]>([]);
  const [alluser, setAllUser] = useState<User[]>([]);
  const [userguest, setUserguest] = useState<User[]>([]);
  const [verifAddUser, setVerifAddUser] = useState(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");

  async function refreshGroupData() {
    if (!context?.groupeActifId) {
      return null;
    }

    const groupId = Number(context.groupeActifId);
    const [resultatUser, resultatAdmin, resultatUserguest, resultatAllUser] = await Promise.all([
      GetUserByGroupe(groupId),
      GetUsersByRole(groupId, ROLE_ADMIN),
      GetUsersByRole(groupId, ROLE_INVITE),
      GetAllUser(),
    ]);

    setUsers(resultatUser);
    setUserAdmin(resultatAdmin);
    setUserguest(resultatUserguest);
    setAllUser(resultatAllUser);
    setIsUrgent(resultatAdmin.length === 0);

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
                (admin: User) => admin.id === context.auth.idUser,
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
    void refreshGroupData();
  }, [context?.groupeActifId]);

  useEffect(() => {
    setCurrentuser(users.find((user) => user.id === context?.auth.idUser));
  }, [users, context?.auth.idUser]);

  const availableUsers = alluser.filter(
    (user) => !users.some((u) => u.id === user.id),
  );

  const uniqueUsers = users.filter(
    (user, index, array) => array.findIndex((u) => u.id === user.id) === index,
  );

  function HandleAddUser() {
    setVerifAddUser((prev) => !prev);
  }

  async function HandlePromoteUser(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    if (isUrgent) {
      await UpdateUsertoAdminUrgent(context.groupeActifId, String(userId));
    } else {
      await UpdateMembreRole(
        context.groupeActifId,
        String(userId),
        ROLE_ADMIN,
        String(context.auth.idUser),
      );
    }

    await refreshGroupData();
  }

  async function HandlePromoteMembre(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    await UpdateMembreRole(
      context.groupeActifId,
      String(userId),
      ROLE_MEMBRE,
      String(context.auth.idUser),
    );

    await refreshGroupData();
  }

  async function HandleDemoteUser(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }
    await UpdateMembreRole(
      context.groupeActifId,
      String(userId),
      ROLE_MEMBRE,
      String(context.auth.idUser),
    );
    await refreshGroupData();
  }

  async function HandleDemoteMembre(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }
    await UpdateMembreRole(
      context.groupeActifId,
      String(userId),
      ROLE_INVITE,
      String(context.auth.idUser),
    );
    await refreshGroupData();
  }

  async function handleAddMember(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    await AddUser(
      context.groupeActifId,
      String(userId),
      String(context.auth.idUser),
    );
    await refreshGroupData();
  }

  async function handleRemoveUser(userId: number) {
    if (!context?.groupeActifId || context.auth.idUser == null) {
      return;
    }

    await RemoveUser(context.groupeActifId, String(userId));
    await refreshGroupData();
  }

  const filteredUsers = availableUsers.filter((user: User) => {
    const fullName = `${user.nom} ${user.prenom} ${user.id}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });
  
  return (
    <>
      <div>
        <ul>
          {uniqueUsers.map((user: User) => (
            <li key={user.id}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                className="m-5"
              >
                {!isUrgent && (
                  <>
                    {user.nom} {user.prenom}{" "}
                    {user.id === currentuser?.id && (
                      <>
                        <UserIcon />
                        <UserStar />
                      </>
                    )}
                    {userAdmin
                      .filter((e) => e.id != currentuser?.id)
                      .some((admin) => admin.id === user.id) ? (
                      <>
                        <UserStar />{" "}
                        <button onClick={() => void HandleDemoteUser(user.id)}>
                          {" "}
                          <ChevronsDown />{" "}
                        </button>
                      </>
                    ) : userguest
                        .filter((e) => e.id != currentuser?.id)
                        .some((guest) => guest.id === user.id) ? (
                      <>
                        <span>: Invité</span>
                        <button
                          type="button"
                          onClick={() => void HandlePromoteMembre(user.id)}
                        >
                          <ChevronUp />
                        </button>
                      </>
                    ) : (
                      user.id !== currentuser?.id && (
                        <>
                          <span>: Membre</span>
                          <button
                            type="button"
                            onClick={() => void HandlePromoteUser(user.id)}
                          >
                            <ChevronsUp />
                          </button>
                          <button
                            type="button"
                            onClick={() => void HandleDemoteMembre(user.id)}
                          >
                            <ChevronDown />
                          </button>
                        </>
                      )
                    )}
                    {user.id !== currentuser?.id && (
                      <button onClick={() => void handleRemoveUser(user.id)}>
                        <LogOut />
                      </button>
                    )}
                  </>
                )}

                {isUrgent && (
                  <>
                    {user.nom} {user.prenom}{" "}
                    <button
                      type="button"
                      onClick={() => void HandlePromoteUser(user.id)}
                    >
                      <ChevronsUp />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button onClick={HandleAddUser} className="m-5">
          {" "}
          <UserPlus />{" "}
        </button>
      </div>
      {verifAddUser && (
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom ou prénom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <ul>
            {filteredUsers.map((user: User) => (
              <li key={user.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                  className="m-5"
                >
                  {user.nom} {user.prenom} : id = {user.id}{" "}
                  <button
                    type="button"
                    onClick={() => void handleAddMember(user.id)}
                  >
                    <CirclePlus />
                  </button>
                </div>
              </li>
            ))}

            {filteredUsers.length === 0 && (
              <li className="text-gray-500 m-5 italic">
                Aucun utilisateur trouvé pour "{searchTerm}".
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
