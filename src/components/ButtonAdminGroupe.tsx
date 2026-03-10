import { useContext, useEffect } from "react";
import { useGetAdminUserByGroupe, useGetUserByGroupe } from "../services/membreService";
import { AuthContext } from "../context/AuthContext";

export function ButtonAdminGroupe(){
  const GetAdminUserByGroupe = useGetAdminUserByGroupe();
  const GetUserByGroupe = useGetUserByGroupe();
  const context = useContext(AuthContext);

  useEffect(() => {
      const fetchUser = async () => {
        if (context?.groupeActifId) {
          const resultatUser = await GetUserByGroupe(Number(context.groupeActifId));
          console.log("réponse:", resultatUser);
        }};
      fetchUser();
    }, []);
  return null;
}