import { useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { Configuration } from "../types/Configuration";
import { apiFetch } from "./apiConfig";

export const useGetConfig = () => {
  const GetConfig = useCallback(async () => {
    try {
      const response = await apiFetch(`/config`, {
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

  return GetConfig;
};

export const useUpdateConfig = () => {
  const UpdateConfig = useCallback(
    async (
      emailAdmin: string,
      maxTaches: number,
      maxGroupes: number,
      maxNotes: number,
      maxMouvements: number,
      maxAchats: number,
      maxPrets: number,
      maxConfigurations: number,
      maxImages: number,
    ) => {
      try {
        const response = await apiFetch(`/config`, {
          method: "PUT",
          body: JSON.stringify({
            emailAdmin: emailAdmin,
            maxTaches: maxTaches,
            maxGroupes: maxGroupes,
            maxNotes: maxNotes,
            maxMouvements: maxMouvements,
            maxAchats: maxAchats,
            maxPrets: maxPrets,
            maxConfigurations: maxConfigurations,
            maxImages: maxImages,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Erreur ${response.status} lors de la mise à jour de la configuration:`,
            errorText,
          );
          throw new Error(errorText || "Problème server");
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
    },
    [],
  );

  return UpdateConfig;
};

export const useGetConfiguration = () => {
  const context = useContext(AuthContext);
  const GetConfig = useCallback(async () => {
    try {
      if (!context?.groupeActifId || context.auth.idUser == null) {
        throw new Error("Problème server");
      }
      const response = await apiFetch(
        `/groupes/${context.groupeActifId}/membres/${context.auth.idUser}/configurations`,
        {
          method: "GET",
        },
      );

      if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        throw new Error("Problème server");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  }, [context?.groupeActifId, context?.auth.idUser]);

  return GetConfig;
};

export const useUpdateConfiguration = () => {
  const UpdateConfig = useCallback(async (configuration: Configuration) => {
    try {
      const response = await apiFetch(`/configurations`, {
        method: "PATCH",
        body: JSON.stringify({
          id: configuration.id,
          idMembre: configuration.idMembre,
          idGroupe: configuration.idGroupe,
          taches: configuration.taches,
          notes: configuration.notes,
          achats: configuration.achats,
          prets: configuration.prets,
          mouvements: configuration.mouvements,
          equipe: configuration.equipe,
          images: configuration.images,
          nom: configuration.nom,
        }),
      });

      if (!response.ok) {
        const errMessage = await response.text();
        console.error("Erreur serveur:", errMessage);
        throw new Error(errMessage || "Problème serveur");
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
  }, []);

  return UpdateConfig;
};

export const useDeleteConfiguration = () => {
  const DeleteConfig = useCallback(async (idConfiguration: number) => {
    try {
      const response = await apiFetch(`/configurations/${idConfiguration}`, {
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
  }, []);

  return DeleteConfig;
};

export const useCreateConfiguration = () => {
  const context = useContext(AuthContext);
  const CreateConfiguration = useCallback(
    async (nom: string) => {
      try {
        if (!context?.groupeActifId || context.auth.idUser == null) {
          throw new Error("Problème serveur");
        }
        const response = await apiFetch(
          `/groupes/${context.groupeActifId}/membres/${context.auth.idUser}/configurations`,
          {
            method: "POST",
            body: nom,
          },
        );

        if (!response.ok) {
          throw new Error("Problème serveur");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Erreur :", error);
        throw error;
      }
    },
    [context?.groupeActifId, context?.auth.idUser],
  );

  return CreateConfiguration;
};
