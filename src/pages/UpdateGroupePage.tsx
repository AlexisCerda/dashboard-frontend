import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGetAdminUserByGroupe, useGetUserByGroupe } from "../services/membreService";
import type { User } from "../types/User";

export function UpdateGroupePage(){
  const GetAdminUserByGroupe = useGetAdminUserByGroupe();
  const GetUserByGroupe = useGetUserByGroupe();
  const context = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
        const fetchUser = async () => {
          if (context?.groupeActifId) {
            const resultatUser: User[] = await GetUserByGroupe(Number(context.groupeActifId));
            setUsers(resultatUser);
          }};
        fetchUser();
    }, [context?.groupeActifId]);



  return <>
    <div>
      <li>
        {users.map((user: User) => (
          <option key={user.id}>
            {user.nom} {user.prenom}
          </option>
        ))}
      </li>
    </div>
  </>;
}