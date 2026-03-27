import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "./apiConfig";

export interface AchatDTO {
  id: number;
  nomMateriel: string;
  marqueMateriel: string;
  reference: string;
  nomPersonne: string;
  prenomPersonne: string;
  quantite: number;
  etat: string;
}

export interface EtatAchatDTO {
  etat: string;
}

export const useGetAchatGroupe = () => {
  const context = useContext(AuthContext);

  const getAchatGroupe = async () => {
    if (!context?.groupeActifId) {
      return null;
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/achats`,
      {
        method: "GET",
      },
    );

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les achats du groupe");
    }

    const data = await response.json();
    return data;
  };

  return getAchatGroupe;
};

export const useUpdateEtatAchat = () => {
  const updateEtatAchat = async (id: number, etat: string) => {
    const response = await apiFetch(`/achats/${id}/etat`, {
      method: "PATCH",
      body: JSON.stringify({ etat }),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'etat de l'achat");
    }

    return await response.json();
  };

  return updateEtatAchat;
};

export const useUpdateAchat = () => {
  const context = useContext(AuthContext);

  const updateAchat = async (achat: AchatDTO) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/achats/${achat.id}`,
      {
        method: "PUT",
        body: JSON.stringify(achat),
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'achat");
    }

    return await response.json();
  };

  return updateAchat;
};

export const useCreateAchat = () => {
  const context = useContext(AuthContext);

  const createAchat = async (achat: AchatDTO) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/achats`,
      {
        method: "POST",
        body: JSON.stringify(achat),
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de créer l'achat");
    }

    return await response.json();
  };

  return createAchat;
};

export const useDeleteAchat = () => {
  const context = useContext(AuthContext);

  const deleteAchat = async (idAchat: number) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/achats/${idAchat}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de supprimer l'achat");
    }

    return await response.text();
  };

  return deleteAchat;
};

export const useGetEtatAchat = () => {
  const getEtatAchat = async (idAchat: number) => {
    const response = await apiFetch(`/achats/${idAchat}/etat`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer l'etat de l'achat");
    }

    return await response.json();
  };

  return getEtatAchat;
};

export const useGetAllEtatsAchat = () => {
  const getAllEtatsAchat = async () => {
    const response = await apiFetch(`/achats/etats`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des achats");
    }

    return await response.json();
  };

  return getAllEtatsAchat;
};
