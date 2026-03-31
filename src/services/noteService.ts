import { useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "./apiConfig";

export interface NoteDTO {
  id: number;
  description: string;
}

export const useGetNotesByMembre = () => {
  const context = useContext(AuthContext);

  const getNotesByMembre = useCallback(async () => {
    if (!context?.auth.idUser) {
      return null;
    }

    const response = await apiFetch(`/membres/${context.auth.idUser}/notes`, {
      method: "GET",
    });

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Impossible de recuperer les notes du membre");
    }

    const data = await response.json();
    return data;
  }, [context?.auth.idUser]);

  return getNotesByMembre;
};

export const useUpdateNoteByMembre = () => {
  const context = useContext(AuthContext);

  const updateNoteByMembre = useCallback(
    async (note: NoteDTO) => {
      if (!context?.auth.idUser) {
        throw new Error("Utilisateur non connecté");
      }

      const response = await apiFetch(
        `/membres/${context.auth.idUser}/notes/${note.id}`,
        {
          method: "PUT",
          body: JSON.stringify(note),
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de mettre à jour la note");
      }

      return await response.json();
    },
    [context?.auth.idUser],
  );

  return updateNoteByMembre;
};

export const useCreateNoteByMembre = () => {
  const context = useContext(AuthContext);

  const createNoteByMembre = useCallback(
    async (note: NoteDTO) => {
      if (!context?.auth.idUser) {
        throw new Error("Utilisateur non connecté");
      }

      const response = await apiFetch(`/membres/${context.auth.idUser}/notes`, {
        method: "POST",
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Impossible de créer la note: ${errorMsg}`);
      }

      return await response.json();
    },
    [context?.auth.idUser],
  );

  return createNoteByMembre;
};

export const useDeleteNote = () => {
  const deleteNote = useCallback(async (idNote: number) => {
    const response = await apiFetch(`/notes/${idNote}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer la note");
    }

    return await response.text();
  }, []);

  return deleteNote;
};
