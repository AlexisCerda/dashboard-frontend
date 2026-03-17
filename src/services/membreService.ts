import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../pages/UpdateUserPage";
import type { Configuration } from "../types/Configuration";

const API_URL = "http://localhost:8080/api";

export const ROLE_INVITE = 0;
export const ROLE_ADMIN = 1;
export const ROLE_MEMBRE = 2;

const getStoredToken = (): string | null => {
  const token = localStorage.getItem("sidsic_token");
  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const useGetCurrentGroupe = () => {
  const context = useContext(AuthContext);

  const getCurrentGroupe = async () => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/groupe-actuel`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer le groupe actif");
    }

    const data = await response.json();
    return data;
  };
  
  return getCurrentGroupe;
};

export const useGetGroupesUtilisateur = () => {
  const context = useContext(AuthContext);

  const getGroupesUtilisateur = async () => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/groupes`, {
        method: "GET",
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: JSON.stringify({
        motDePasse: pwd
      }),
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

export const useGetUsersByRoleGroupe = () => {
  const GetUsersByRoleGroupe = async (idGroupe: number, role: number) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres/role/${role}`, {
        method: "GET",
        headers: getAuthHeaders(),
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

  return GetUsersByRoleGroupe;
}

export const useGetUserByGroupe = () => {
  const GetUserByGroupe = async (idGroupe : number) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres`, {
        method: "GET",
        headers: getAuthHeaders(),
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        nom: u.nom,
        prenom : u.prenom,
        email : u.email,
        motDePasse: pwd
      }),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        return data;
      }

      return null;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return CreateUser;
}

export const useGetAllUser = ()=>{
  const GetAllUser = async () => {
    try {
      const response = await fetch(`${API_URL}/membres`, {
        method: "GET",
        headers: getAuthHeaders(),
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

  return GetAllUser;
}

export const useAddUserByGroupe = ()=>{
  const AddUser = async (idGroupe : string, idMembre: string, idMembreActuel: string) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres/${idMembre}/added-by/${idMembreActuel}`, {
        method: "POST",
        headers: getAuthHeaders(),
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

  return AddUser;
}

export const useUpdateMembreRole = ()=>{
  const UpdateMembreRole = async (
    idGroupe: string,
    idMembre: string,
    role: number,
    idMembreActuel: string,
  ) => {
    if (![ROLE_INVITE, ROLE_ADMIN, ROLE_MEMBRE].includes(role)) {
      throw new Error("Rôle invalide");
    }

    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres/${idMembre}/role/${role}/by/${idMembreActuel}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
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

  return UpdateMembreRole;
}

export const useRemoveUserByGroupe = ()=>{
  const UserAdmin = async (idGroupe : string, idMembre: string) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres/${idMembre}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      return null;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return UserAdmin;
}

export const useDeleteUser = ()=>{
  const UserAdmin = async (idMembre: string) => {
    try {
      const response = await fetch(`${API_URL}/membres/${idMembre}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      return null;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return UserAdmin;
}

export const useUpdateMembreToAdminUrgent = ()=>{
  const UserAdmin = async (idGroupe : string, idMembre: string) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}/membres/${idMembre}/role/${ROLE_ADMIN}/urgent`, {
        method: "PATCH",
        headers: getAuthHeaders(),
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

  return UserAdmin;
}

export const useCreateGroupe = ()=>{
  const CreateGroupe = async (idUser : number, nom : string) => {
    try {
      const response = await fetch(`${API_URL}/membres/${idUser}/groupes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
        id: 0,
        nom: nom,
        ville:"",
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

  return CreateGroupe;
}

export const useGetConfig = ()=>{
  const GetConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/config`, {
        method: "GET",
        headers: getAuthHeaders(),
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

  return GetConfig;
}

export const useUpdateConfig = ()=>{
  const UpdateConfig = async (emailAdmin : string, maxTaches : number, maxGroupes : number, maxNotes : number, maxMouvements : number, maxAchats : number, maxPrets : number) => {
    try {
      const response = await fetch(`${API_URL}/config`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
        emailAdmin : emailAdmin,
        maxTaches : maxTaches,
        maxGroupes : maxGroupes,
        maxNotes : maxNotes,
        maxMouvements : maxMouvements,
        maxAchats : maxAchats,
        maxPrets : maxPrets
      }),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }

      return await response.text();

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return UpdateConfig;
}
export const useGetGroupesByUser = () => {

  const getGroupesUtilisateur = async (idUser : number ) => {
    try {
      const response = await fetch(`${API_URL}/membres/${idUser}/groupes`, {
        method: "GET",
        headers: getAuthHeaders(),
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

export const useGetDateLastCoByUser = () => {

  const getDateLastCo = async (idUser : number ) => {
    try {
      const response = await fetch(`${API_URL}/membres/${idUser}/last-co`, {
        method: "GET",
        headers: getAuthHeaders(),
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

  return getDateLastCo;
};

export const useGetAllGroupes = () => {

  const GetAllGroupes = async () => {
    try {
      const response = await fetch(`${API_URL}/groupes`, {
        method: "GET",
        headers: getAuthHeaders(),
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

  return GetAllGroupes;
};

export const useDeleteGroupe = ()=>{
  const DeleteGroupe = async (idGroupe: string) => {
    try {
      const response = await fetch(`${API_URL}/groupes/${idGroupe}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      return null;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return DeleteGroupe;
}


export const useGetConfiguration = ()=>{
  const context = useContext(AuthContext);
  const GetConfig = async () => {
    try {
      if (!context?.groupeActifId || context.auth.idUser == null) {
        throw new Error("Problème server");
      }
      const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/membres/${context.auth.idUser}/configurations`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        throw new Error("Problème server");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (error == "404") {
        return [];
      }
      console.error("Erreur :", error);
      throw error;
    }
  };

  return GetConfig;
}
export const useUpdateConfiguration = ()=>{
  const UpdateConfig = async (configuration : Configuration) => {
    try {
      const response = await fetch(`${API_URL}/configuration`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
        id : configuration.id,
        idMembre : configuration.idMembre,
        idGroupe : configuration.idGroupe,
        taches : configuration.taches,
        notes : configuration.notes,
        achats : configuration.achats,
        prets : configuration.prets,
        mouvements : configuration.mouvements,
        nom : configuration.nom 
      }),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }

      return await response.text();

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return UpdateConfig;
}
export const useDeleteConfiguration = ()=>{
  const DeleteConfig = async (idConfiguration: number) => {
    try {
      const response = await fetch(`${API_URL}/configuration/${idConfiguration}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Problème server");
      }

      return null;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return DeleteConfig;
}
export const useCreateConfiguration = ()=>{
  const context = useContext(AuthContext);
  const CreateConfiguration = async () => {
    try {
      if (!context?.groupeActifId || context.auth.idUser == null) {
        throw new Error("Problème serveur");
      }
      const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/membres/${context.auth.idUser}/configurations`, {
        method: "POST",
        headers: getAuthHeaders(),
      }); 

      if (!response.ok) {
        throw new Error("Problème serveur");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return CreateConfiguration;
}

