import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { Configuration } from "../types/Configuration";
import { API_URL, getAuthHeaders } from "./apiConfig";

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
  const UpdateConfig = async (emailAdmin : string, maxTaches : number, maxGroupes : number, maxNotes : number, maxMouvements : number, maxAchats : number, maxPrets : number, maxConfigurations : number, maxImages : number) => {
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
        maxPrets : maxPrets,
        maxConfigurations : maxConfigurations,
        maxImages : maxImages
      }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status} lors de la mise à jour de la configuration:`, errorText);
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
  };

  return UpdateConfig;
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
      console.error("Erreur :", error);
      throw error;
    }
  };

  return GetConfig;
}

export const useUpdateConfiguration = ()=>{
  const UpdateConfig = async (configuration : Configuration) => {
    try {
      const response = await fetch(`${API_URL}/configurations`, {
        method: "PATCH",
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
        equipe : configuration.equipe,
        images: configuration.images,
        nom : configuration.nom
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
  };

  return UpdateConfig;
}

export const useDeleteConfiguration = ()=>{
  const DeleteConfig = async (idConfiguration: number) => {
    try {
      const response = await fetch(`${API_URL}/configurations/${idConfiguration}`, {
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
  const CreateConfiguration = async (nom: string) => {
    try {
      if (!context?.groupeActifId || context.auth.idUser == null) {
        throw new Error("Problème serveur");
      }
      const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/membres/${context.auth.idUser}/configurations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: nom,
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
