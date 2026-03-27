import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch, ROLE_INVITE, ROLE_ADMIN, ROLE_MEMBRE } from "./apiConfig";

export const useGetCurrentGroupe = () => {
  const context = useContext(AuthContext);

  const getCurrentGroupe = async () => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await apiFetch(`/membres/${context?.auth.idUser}/groupe-actuel`, {
      method: "GET",
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
      const response = await apiFetch(`/membres/${context?.auth.idUser}/groupes`, {
        method: "GET",
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

export const useGetGroupesByUser = () => {

  const getGroupesUtilisateur = async (idUser : number ) => {
    try {
      const response = await apiFetch(`/membres/${idUser}/groupes`, {
        method: "GET",
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
      const response = await apiFetch(`/membres/${context?.auth.idUser}/groupe-actuel/${groupeId}`, {
        method: "PATCH",
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

export const useGetUsersByRoleGroupe = () => {
  const GetUsersByRoleGroupe = async (idGroupe: number, role: number) => {
    try {
      const response = await apiFetch(`/groupes/${idGroupe}/membres/role/${role}`, {
        method: "GET",
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
      const response = await apiFetch(`/groupes/${idGroupe}/membres`, {
        method: "GET",
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

export const useAddUserByGroupe = ()=>{
  const AddUser = async (idGroupe : string, idMembre: string, idMembreActuel: string) => {
    try {
      const response = await apiFetch(`/groupes/${idGroupe}/membres/${idMembre}/added-by/${idMembreActuel}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status} lors de l'ajout de l'utilisateur ${idMembre} au groupe ${idGroupe}:`, errorText);
        throw new Error(errorText || "Problème server");
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
      const response = await apiFetch(`/groupes/${idGroupe}/membres/${idMembre}/role/${role}/by/${idMembreActuel}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status} lors de la mise à jour du rôle de l'utilisateur ${idMembre} dans le groupe ${idGroupe}:`, errorText);
        throw new Error(errorText || "Problème server");
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
      const response = await apiFetch(`/groupes/${idGroupe}/membres/${idMembre}`, {
        method: "DELETE",
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
      const response = await apiFetch(`/groupes/${idGroupe}/membres/${idMembre}/role/${ROLE_ADMIN}/urgent`, {
        method: "PATCH",
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
      const response = await apiFetch(`/membres/${idUser}/groupes`, {
        method: "POST",
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

export const useGetAllGroupes = () => {

  const GetAllGroupes = async () => {
    try {
      const response = await apiFetch(`/groupes`, {
        method: "GET",
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
      const response = await apiFetch(`/groupes/${idGroupe}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status} lors de la suppression du groupe ${idGroupe}:`, errorText);
        throw new Error(errorText || "Problème server");
      }

      return null;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return DeleteGroupe;
}
