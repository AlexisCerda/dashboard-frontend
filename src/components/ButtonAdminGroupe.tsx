import { useContext, useEffect, useState } from "react";
import { useGetAdminUserByGroupe } from "../services/membreService";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../types/User";
import { Link } from "react-router-dom";
import { Cog, Settings2 } from "lucide-react";

export function ButtonAdminGroupe(){
  const GetAdminUserByGroupe = useGetAdminUserByGroupe();
  const context = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
      const fetchUser = async () => {
        if (context?.groupeActifId) {
          const resultatUser: User[] = await GetAdminUserByGroupe(Number(context.groupeActifId));
          const foundUser = resultatUser.find((u) => u.id === context.auth.idUser) ?? null;
          setUser(foundUser);
        }};
      fetchUser();
  }, [context?.groupeActifId]);
  
  if(!user){
    return <></>;
  }

  return <Link to="update-group">
    <Settings2/>
  </Link>;
}