import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "./apiConfig";

export interface MouvementDTO {
  id: number;
  nom: string;
  prenom: string;
  dateArrivee: string;
  dateDepart: string;
  etat: string;
}

export interface EtatMouvementDTO {
  etat: string;
}

export const useGetMouvementGroupe = () => {
  const context = useContext(AuthContext);

  const getMouvementGroupe = async () => {
    if (!context?.groupeActifId) {
      return null;
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/mouvements`,
      {
        method: "GET",
      },
    );

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les mouvements du groupe");
    }

    const data = await response.json();
    return data;
  };

  return getMouvementGroupe;
};

export const useUpdateEtatMouvement = () => {
  const updateEtatMouvement = async (id: number, etat: string) => {
    const response = await apiFetch(`/mouvements/${id}/etat`, {
      method: "PATCH",
      body: JSON.stringify({ etat }),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'etat du mouvement");
    }

    return await response.json();
  };

  return updateEtatMouvement;
};

export const useUpdateMouvement = () => {
  const context = useContext(AuthContext);

  const updateMouvement = async (mouvement: MouvementDTO) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/mouvements/${mouvement.id}`,
      {
        method: "PUT",
        body: JSON.stringify(mouvement),
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour le mouvement");
    }

    return await response.json();
  };

  return updateMouvement;
};

export const useCreateMouvement = () => {
  const context = useContext(AuthContext);

  const createMouvement = async (mouvement: MouvementDTO) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/mouvements`,
      {
        method: "POST",
        body: JSON.stringify(mouvement),
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de créer le mouvement");
    }

    return await response.json();
  };

  return createMouvement;
};

export const useDeleteMouvement = () => {
  const context = useContext(AuthContext);

  const deleteMouvement = async (idMouvement: number) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/mouvements/${idMouvement}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de supprimer le mouvement");
    }

    return await response.text();
  };

  return deleteMouvement;
};

export const useGetEtatMouvement = () => {
  const getEtatMouvement = async (idMouvement: number) => {
    const response = await apiFetch(`/mouvements/${idMouvement}/etat`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer l'etat du mouvement");
    }

    return await response.json();
  };

  return getEtatMouvement;
};

export const useGetAllEtatsMouvement = () => {
  const getAllEtatsMouvement = async () => {
    const response = await apiFetch(`/mouvements/etats`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des mouvements");
    }

    return await response.json();
  };

  return getAllEtatsMouvement;
};
