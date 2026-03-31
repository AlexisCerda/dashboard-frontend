import { useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../pages/UpdateUserPage";
import { apiFetch } from "./apiConfig";

export interface MembreDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export const useGetUser = () => {
  const context = useContext(AuthContext);

  const getUser = useCallback(async () => {
    try {
      const response = await apiFetch(`/membres/${context?.auth.idUser}`, {
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
  }, [context?.auth.idUser]);

  return getUser;
};

export const useUpdateUser = () => {
  const context = useContext(AuthContext);

  const updateUser = useCallback(
    async (u: User) => {
      try {
        const response = await apiFetch(`/membres/`, {
          method: "PUT",
          body: JSON.stringify({
            id: context?.auth.idUser,
            nom: u.nom,
            prenom: u.prenom,
            email: u.email,
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
    },
    [context?.auth.idUser],
  );

  return updateUser;
};

export const useUpdatePwdUser = () => {
  const context = useContext(AuthContext);

  const updateUser = useCallback(
    async (pwd: string) => {
      try {
        const response = await apiFetch(
          `/membres/${context?.auth.idUser}/pwd`,
          {
            method: "PATCH",
            body: JSON.stringify({
              motDePasse: pwd,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("L'utilisateur n'existe pas");
        }

        return "OK";
      } catch (error) {
        console.error("Erreur :", error);
        throw error;
      }
    },
    [context?.auth.idUser],
  );

  return updateUser;
};

export const useCreateUser = () => {
  const CreateUser = useCallback(async (pwd: string, u: User) => {
    try {
      const response = await apiFetch(`/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          motDePasse: pwd,
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
  }, []);

  return CreateUser;
};

export const useGetAllUser = () => {
  const GetAllUser = useCallback(async () => {
    try {
      const response = await apiFetch(`/membres`, {
        method: "GET",
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
  }, []);

  return GetAllUser;
};

export const useDeleteUser = () => {
  const UserAdmin = useCallback(async (idMembre: string) => {
    try {
      const response = await apiFetch(`/membres/${idMembre}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Erreur ${response.status} lors de la suppression de l'utilisateur ${idMembre}:`,
          errorText,
        );
        throw new Error(errorText || "Problème server");
      }

      return null;
    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  }, []);

  return UserAdmin;
};

export const useGetDateLastCoByUser = () => {
  const getDateLastCo = useCallback(async (idUser: number) => {
    try {
      const response = await apiFetch(`/membres/${idUser}/last-co`, {
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
  }, []);

  return getDateLastCo;
};
