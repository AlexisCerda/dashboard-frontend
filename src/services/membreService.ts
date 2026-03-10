import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../pages/UpdateUserPage";

const API_URL = "http://localhost:8080/api";

export const useGetCurrentGroupe = () => {
  const context = useContext(AuthContext);

  const getCurrentGroupe = async () => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/groupe-actuel`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("L'utilisateur n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };
  
  return getCurrentGroupe;
};

export const useGetGroupesUtilisateur = () => {
  const context = useContext(AuthContext);

  const getGroupesUtilisateur = async () => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/groupes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("L'utilisateur n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return getGroupesUtilisateur;
};

export const usePatchCurrentGroupe = () => {
  const context = useContext(AuthContext);

  const patchCurrentGroupe = async (groupeId: number) => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/groupe-actuel/${groupeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("L'utilisateur ou le groupe n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return patchCurrentGroupe;
}

export const useGetUser = () => {
  const context = useContext(AuthContext);

  const getUser = async () => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("L'utilisateur n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return getUser;
}

export const useUpdateUser = () => {
  const context = useContext(AuthContext);

  const updateUser = async (u : User) => {
    try {
      const response = await fetch(`${API_URL}/membres/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        id: context?.auth.idUser,
        nom: u.nom,
        prenom : u.prenom,
        email : u.email
      }),
      });

      if (!response.ok) {
        throw new Error("L'utilisateur n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return updateUser;
}

export const useUpdatePwdUser = () => {
  const context = useContext(AuthContext);

  const updateUser = async (pwd : string) => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/pwd`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: pwd,
      });

      if (!response.ok) {
        throw new Error("L'utilisateur n'existe pas");
      }

      return "OK";

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return updateUser;
}

export const useGetAdminUserByGroupe = () => {

  const GetAdminUserByGroupe = async (idGroupe : number) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres/admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Le groupe n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return GetAdminUserByGroupe;
}

export const useGetUserByGroupe = () => {
  const GetUserByGroupe = async (idGroupe : number) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Le groupe n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return GetUserByGroupe;
}

export const useCreateUser = ()=>{
  const CreateUser = async (pwd : string, u : User ) => {
    try {
      const response = await fetch(`${API_URL}/membres/${pwd}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        id: 0,
        nom: u.nom,
        prenom : u.prenom,
        email : u.email
      }),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return CreateUser;
}
