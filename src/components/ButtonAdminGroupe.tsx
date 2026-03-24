import { useContext, useEffect, useState } from "react";
import { useGetUsersByRoleGroupe } from "../services/groupeService";
import { ROLE_ADMIN } from "../services/apiConfig";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../types/User";
import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";

export function ButtonAdminGroupe(){
  const GetUsersByRole = useGetUsersByRoleGroupe();
  const context = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  useEffect(() => {
      const fetchUser = async () => {
        if (context?.groupeActifId) {
          const resultatUser: User[] = await GetUsersByRole(Number(context.groupeActifId), ROLE_ADMIN);
          const foundUser = resultatUser.find((u) => u.id === context.auth.idUser) ?? null;
          setUser(foundUser);
          if(resultatUser.length === 0){
            setIsUrgent(true);
          }else{
            setIsUrgent(false);
          }
          
        }};
      fetchUser();
  }, [context?.groupeActifId]);
  if(!user && isUrgent === false){
    return <></>;
  } else {

  return <Link to="/update-group" className="p-2 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors" title="Gérer le groupe">
    <Settings2/>
  </Link>;
  }
}