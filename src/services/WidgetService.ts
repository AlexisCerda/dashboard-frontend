import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export interface TacheDTO {
  id: number;
  nom: string;
  description: string;
  dateDebut: string | null;
  dateLimite: string | null;
  etat: string;  
  membresIds?: number[];
}

export interface MembreDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export interface AddMembreTache {
  idMembre: number;
}

export interface EtatTacheDTO {
  etat: string;
}

export interface MouvementDTO {
  id: number;
  nom: string;
  prenom: string;
  dateArrivee: string;
  dateDepart: string;  
  etat : string;
}

export interface EtatMouvementDTO {
  etat: string;
}

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

export interface NoteDTO {
  id: number;
  description: string;
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
  const updateTache = async (tache: TacheDTO) => {
    const response = await fetch(`${API_URL}/taches`, {
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
  const context = useContext(AuthContext);
  const addTache = async (tache: TacheDTO) => {
    const response = await fetch(`${API_URL}/groupes/${context?.groupeActifId}/taches`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(tache),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("Erreur serveur lors de l'ajout de la tache:", errorMsg);
      throw new Error(`Impossible d'ajouter la tache: ${errorMsg}`);
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

export const useGetMembreByTache= () => {
  const context = useContext(AuthContext);

  const getMembreByTache = async (idTache: number) => {
    if (!context?.auth.idUser) {
      return null;
    } 

    const response = await fetch(`${API_URL}/taches/${idTache}/membres`, {
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
  
  return getMembreByTache;
};

//############### PARTIE MOUVEMENTS ###############

export const useGetMouvementGroupe = () => {
  const context = useContext(AuthContext);

  const getMouvementGroupe = async () => {
    if (!context?.groupeActifId) {
      return null;
    }

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/mouvements`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

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
    const response = await fetch(`${API_URL}/mouvements/${id}/etat`, {
      method: "PATCH",
      headers: getAuthHeaders(),
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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/mouvements/${mouvement.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(mouvement),
    });

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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/mouvements`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(mouvement),
    });

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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/mouvements/${idMouvement}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer le mouvement");
    }

    return await response.text();
  };

  return deleteMouvement;
};

export const useGetEtatMouvement = () => {
  const getEtatMouvement = async (idMouvement: number) => {
    const response = await fetch(`${API_URL}/mouvements/${idMouvement}/etat`, {
      method: "GET",
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/mouvements/etats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des mouvements");
    }

    return await response.json();
  };

  return getAllEtatsMouvement;
};

//############### PARTIE ACHATS ###############

export const useGetAchatGroupe = () => {
  const context = useContext(AuthContext);

  const getAchatGroupe = async () => {
    if (!context?.groupeActifId) {
      return null;
    }

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/achats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

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
    const response = await fetch(`${API_URL}/achats/${id}/etat`, {
      method: "PATCH",
      headers: getAuthHeaders(),
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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/achats/${achat.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(achat),
    });

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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/achats`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(achat),
    });

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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/achats/${idAchat}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer l'achat");
    }

    return await response.text();
  };

  return deleteAchat;
};

export const useGetEtatAchat = () => {
  const getEtatAchat = async (idAchat: number) => {
    const response = await fetch(`${API_URL}/achats/${idAchat}/etat`, {
      method: "GET",
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/achats/etats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des achats");
    }

    return await response.json();
  };

  return getAllEtatsAchat;
};

//############### PARTIE PRETS ###############

export const useGetPretGroupe = () => {
  const context = useContext(AuthContext);

  const getPretGroupe = async () => {
    if (!context?.groupeActifId) {
      return null;
    }

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/prets`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

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
    const response = await fetch(`${API_URL}/prets/${id}/etat`, {
      method: "PATCH",
      headers: getAuthHeaders(),
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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/prets/${pret.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(pret),
    });

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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/prets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(pret),
    });

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

    const response = await fetch(`${API_URL}/groupes/${context.groupeActifId}/prets/${idPret}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer le pret");
    }

    return await response.text();
  };

  return deletePret;
};

export const useGetEtatPret = () => {
  const getEtatPret = async (idPret: number) => {
    const response = await fetch(`${API_URL}/prets/${idPret}/etat`, {
      method: "GET",
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/prets/etats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les etats des prets");
    }

    return await response.json();
  };

  return getAllEtatsPret;
};

//############### PARTIE NOTES ###############

export const useGetNotesByMembre = () => {
  const context = useContext(AuthContext);

  const getNotesByMembre = async () => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await fetch(`${API_URL}/membres/${context.auth.idUser}/notes`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les notes du membre");
    }

    const data = await response.json();
    return data;
  };

  return getNotesByMembre;
};

export const useUpdateNoteByMembre = () => {
  const context = useContext(AuthContext);

  const updateNoteByMembre = async (note: NoteDTO) => {
    if (!context?.auth.idUser) {
      throw new Error("Utilisateur non connecté");
    }

    const response = await fetch(`${API_URL}/membres/${context.auth.idUser}/notes/${note.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour la note");
    }

    return await response.json();
  };

  return updateNoteByMembre;
};

export const useCreateNoteByMembre = () => {
  const context = useContext(AuthContext);

  const createNoteByMembre = async (note: NoteDTO) => {
    if (!context?.auth.idUser) {
      throw new Error("Utilisateur non connecté");
    }

    const response = await fetch(`${API_URL}/membres/${context.auth.idUser}/notes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Impossible de créer la note: ${errorMsg}`);
    }

    return await response.json();
  };

  return createNoteByMembre;
};

export const useDeleteNote = () => {
  const deleteNote = async (idNote: number) => {
    const response = await fetch(`${API_URL}/notes/${idNote}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer la note");
    }

    return await response.text();
  };

  return deleteNote;
};