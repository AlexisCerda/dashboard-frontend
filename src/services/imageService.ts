import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_URL, getAuthHeaders, getStoredToken } from "./apiConfig";

export interface ImageDTO {
  id: number;
  nom: string;
  path: string;
}

export const useGetImagesByMembre = () => {
  const context = useContext(AuthContext);
  const getImagesByMembre = async (idMembre?: number) => {
    const membreId = idMembre ?? context?.auth.idUser;
    if (!membreId) return [];
    const response = await fetch(`${API_URL}/membres/${membreId}/images`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (response.status === 404) {
      return [];
    }
    if (!response.ok)
      throw new Error("Impossible de récupérer les images du membre");
    return await response.json();
  };
  return getImagesByMembre;
};

export const useCreateImageByMembre = () => {
  const context = useContext(AuthContext);

  const createImageByMembre = async (file: File, idMembre?: number) => {
    const membreId = idMembre ?? context?.auth.idUser;
    if (!membreId) throw new Error("Utilisateur non connecté");

    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};

    const token = getStoredToken(); 
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/membres/${membreId}/images`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Détail Spring Boot :", errorText);
      throw new Error("Impossible de créer l'image : " + response.status);
    }

    return await response.json();
  };

  return createImageByMembre;
};

export const useUpdateImageByMembre = () => {
  const context = useContext(AuthContext);
  const updateImageByMembre = async (image: ImageDTO, idMembre?: number) => {
    const membreId = idMembre ?? context?.auth.idUser;
    if (!membreId) throw new Error("Utilisateur non connecté");
    const response = await fetch(
      `${API_URL}/membres/${membreId}/images/${image.id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(image),
      },
    );
    if (!response.ok) throw new Error("Impossible de mettre à jour l'image");
    return await response.json();
  };
  return updateImageByMembre;
};

export const useDeleteImage = () => {
  const deleteImage = async (idImage: number) => {
    const response = await fetch(`${API_URL}/images/${idImage}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Impossible de supprimer l'image");
    return await response.text();
  };
  return deleteImage;
};
