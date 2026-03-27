import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "./apiConfig";

export interface PretDTO {
  id: number;
  nomMateriel: string;
  marqueMateriel: string;
  nomPersonne: string;
  prenomPersonne: string;
  quantite: number;
  etat: string;
  dateDebut: string;
  dateFin: string;
}

export interface EtatPretDTO {
  etat: string;
}

export const useGetPretGroupe = () => {
  const context = useContext(AuthContext);

  const getPretGroupe = async () => {
    if (!context?.groupeActifId) {
      return null;
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/prets`,
      {
        method: "GET",
      },
    );

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les prets du groupe");
    }

    const data = await response.json();
    return data;
  };

  return getPretGroupe;
};

export const useUpdateEtatPret = () => {
  const updateEtatPret = async (id: number, etat: string) => {
    const response = await apiFetch(`/prets/${id}/etat`, {
      method: "PATCH",
      body: JSON.stringify({ etat }),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'etat du pret");
    }

    return await response.json();
  };

  return updateEtatPret;
};

export const useUpdatePret = () => {
  const context = useContext(AuthContext);

  const updatePret = async (pret: PretDTO) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/prets/${pret.id}`,
      {
        method: "PUT",
        body: JSON.stringify(pret),
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour le pret");
    }

    return await response.json();
  };

  return updatePret;
};

export const useCreatePret = () => {
  const context = useContext(AuthContext);

  const createPret = async (pret: PretDTO) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/prets`,
      {
        method: "POST",
        body: JSON.stringify(pret),
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de créer le pret");
    }

    return await response.json();
  };

  return createPret;
};

export const useDeletePret = () => {
  const context = useContext(AuthContext);

  const deletePret = async (idPret: number) => {
    if (!context?.groupeActifId) {
      throw new Error("Aucun groupe actif");
    }

    const response = await apiFetch(
      `/groupes/${context.groupeActifId}/prets/${idPret}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de supprimer le pret");
    }

    return await response.text();
  };

  return deletePret;
};

export const useGetEtatPret = () => {
  const getEtatPret = async (idPret: number) => {
    const response = await apiFetch(`/prets/${idPret}/etat`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer l'etat du pret");
    }

    return await response.json();
  };

  return getEtatPret;
};

export const useGetAllEtatsPret = () => {
  const getAllEtatsPret = async () => {
    const response = await apiFetch(`/prets/etats`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des prets");
    }

    return await response.json();
  };

  return getAllEtatsPret;
};
