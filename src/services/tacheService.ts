import { useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "./apiConfig";

export interface TacheDTO {
  id: number;
  nom: string;
  description: string;
  dateDebut: string | null;
  dateLimite: string | null;
  etat: string;
  membresIds?: number[];
  mouvement?: import("./mouvementService").MouvementDTO | null;
  mouvementId?: number | null;
}

export interface EtatTacheDTO {
  etat: string;
}

export interface AddMembreTache {
  idMembre: number;
}

export const useGetTacheGroupe = () => {
  const context = useContext(AuthContext);

  const getTacheGroupe = useCallback(async () => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await apiFetch(
      `/groupes/${context?.groupeActifId}/taches`,
      {
        method: "GET",
      },
    );

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les taches du groupe");
    }

    const data = await response.json();
    return data;
  }, [context?.auth.idUser, context?.groupeActifId]);

  return getTacheGroupe;
};

export const useGetTacheMembre = () => {
  const context = useContext(AuthContext);

  const getTacheMembre = useCallback(async () => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await apiFetch(
      `/membres/${context?.auth.idUser}/taches`,
      {
        method: "GET",
      },
    );

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les taches du membre");
    }

    const data = await response.json();
    return data;
  }, [context?.auth.idUser]);

  return getTacheMembre;
};

export const useAddMembreToTache = () => {
  const addMembreToTache = useCallback(async (idTache: number, idMembre: number) => {
    const response = await apiFetch(`/taches/${idTache}/membres`, {
      method: "POST",
      body: JSON.stringify({ idMembre }),
    });

    if (!response.ok) {
      throw new Error("Impossible d'ajouter le membre à la tache");
    }

    return await response.json();
  }, []);

  return addMembreToTache;
};

export const useDeleteMembreFromTache = () => {
  const deleteMembreFromTache = useCallback(async (idTache: number, idMembre: number) => {
    const response = await apiFetch(
      `/taches/${idTache}/membres/${idMembre}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("Impossible de supprimer le membre de la tache");
    }

    return await response.json();
  }, []);

  return deleteMembreFromTache;
};

export const useUpdateTache = () => {
  const updateTache = useCallback(async (tache: TacheDTO) => {
    const response = await apiFetch(`/taches`, {
      method: "PUT",
      body: JSON.stringify(tache),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour la tache");
    }

    return await response.json();
  }, []);

  return updateTache;
};

export const useDeleteTache = () => {
  const deleteTache = useCallback(async (id: number) => {
    const response = await apiFetch(`/taches/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer la tache");
    }

    return await response.text();
  }, []);

  return deleteTache;
};

export const useAddTache = () => {
  const context = useContext(AuthContext);
  const addTache = useCallback(async (tache: TacheDTO) => {
    const response = await apiFetch(
      `/groupes/${context?.groupeActifId}/taches`,
      {
        method: "POST",
        body: JSON.stringify(tache),
      },
    );

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("Erreur serveur lors de l'ajout de la tache:", errorMsg);
      throw new Error(`Impossible d'ajouter la tache: ${errorMsg}`);
    }

    return await response.json();
  }, [context?.groupeActifId]);

  return addTache;
};

export const useUpdateEtatTache = () => {
  const updateEtatTache = useCallback(async (id: number, etat: string) => {
    const response = await apiFetch(`/taches/${id}/etat`, {
      method: "PATCH",
      body: JSON.stringify({ etat }),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'etat de la tache");
    }

    return await response.json();
  }, []);

  return updateEtatTache;
};

export const useGetEtatTache = () => {
  const getEtatTache = useCallback(async () => {
    const response = await apiFetch(`/taches/etats`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des taches");
    }

    return await response.json();
  }, []);

  return getEtatTache;
};

export const useGetMembreByTache = () => {
  const context = useContext(AuthContext);

  const getMembreByTache = useCallback(async (idTache: number) => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await apiFetch(`/taches/${idTache}/membres`, {
      method: "GET",
    });

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les membres de la tache");
    }

    const data = await response.json();
    return data;
  }, [context?.auth.idUser]);

  return getMembreByTache;
};
