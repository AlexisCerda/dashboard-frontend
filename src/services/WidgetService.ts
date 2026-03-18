import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export interface TacheDTO {
  id: number;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;    
}

export interface AddMembreTache {
  idMembre: number;
}

export interface EtatTacheDTO {
  etat: string;
}

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

export const useGetTacheGroupe= () => {
  const context = useContext(AuthContext);

  const getTacheGroupe = async () => {
    if (!context?.auth.idUser) {
      return null;
    } 

    const response = await fetch(`${API_URL}/groupes/${context?.groupeActifId}/taches`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les taches du groupe");
    }

    const data = await response.json();
    return data;
  };
  
  return getTacheGroupe;
};

export const useGetTacheMembre= () => {
  const context = useContext(AuthContext);

  const getTacheMembre = async () => {
    if (!context?.auth.idUser) {
      return null;
    } 

    const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/taches`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les taches du membre");
    }

    const data = await response.json();
    return data;
  };
  
  return getTacheMembre;
};

export const useAddMembreToTache = () => {
  const addMembreToTache = async (idTache: number, idMembre: number) => {
    const response = await fetch(`${API_URL}/taches/${idTache}/membres`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ idMembre }),
    });

    if (!response.ok) {
      throw new Error("Impossible d'ajouter le membre à la tache");
    }

    return await response.json();
  };

  return addMembreToTache;
};

export const useDeleteMembreFromTache = () => {
  const deleteMembreFromTache = async (idTache: number, idMembre: number) => {
    const response = await fetch(`${API_URL}/taches/${idTache}/membres/${idMembre}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer le membre de la tache");
    }

    return await response.json();
  };

  return deleteMembreFromTache;
};

export const useUpdateTache = () => {
  const updateTache = async (id: number, tache: TacheDTO) => {
    const response = await fetch(`${API_URL}/taches/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(tache),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour la tache");
    }

    return await response.json();
  };

  return updateTache;
};

export const useDeleteTache = () => {
  const deleteTache = async (id: number) => {
    const response = await fetch(`${API_URL}/taches/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer la tache");
    }

    return await response.text();
  };

  return deleteTache;
};

export const useAddTache = () => {
  const addTache = async (idGroupe: number, tache: TacheDTO) => {
    const response = await fetch(`${API_URL}/groupes/${idGroupe}/taches`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(tache),
    });

    if (!response.ok) {
      throw new Error("Impossible d'ajouter la tache");
    }

    return await response.json();
  };

  return addTache;
};

export const useUpdateEtatTache = () => {
  const updateEtatTache = async (id: number, etat: string) => {
    const response = await fetch(`${API_URL}/taches/${id}/etat`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ etat }),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'etat de la tache");
    }

    return await response.json();
  };

  return updateEtatTache;
};

export const useGetEtatTache = () => {
  const getEtatTache = async () => {
    const response = await fetch(`${API_URL}/taches/etats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des taches");
    }

    return await response.json();
  };

  return getEtatTache;
};