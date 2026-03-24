import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_URL, getAuthHeaders } from "./apiConfig";

export interface NoteDTO {
  id: number;
  description: string;
}

export const useGetNotesByMembre = () => {
  const context = useContext(AuthContext);

  const getNotesByMembre = async () => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await fetch(
      `${API_URL}/membres/${context.auth.idUser}/notes`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

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

    const response = await fetch(
      `${API_URL}/membres/${context.auth.idUser}/notes/${note.id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(note),
      },
    );

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

    const response = await fetch(
      `${API_URL}/membres/${context.auth.idUser}/notes`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(note),
      },
    );

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
