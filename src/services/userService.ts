import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../pages/UpdateUserPage";
import { API_URL, getAuthHeaders } from "./apiConfig";

export interface MembreDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
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
          prenom: u.prenom,
          email: u.email
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

export const useDeleteUser = ()=>{
  const UserAdmin = async (idMembre: string) => {
    try {
      const response = await fetch(`${API_URL}/membres/${idMembre}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status} lors de la suppression de l'utilisateur ${idMembre}:`, errorText);
        throw new Error(errorText || "Problème server");
      }

      return null;

    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  return UserAdmin;
}

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
