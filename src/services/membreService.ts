import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:8080/api";

export const useGetCurrentGroupe = () => {
  const context = useContext(AuthContext);

  const getCurrentGroupe = async () => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/groupe-actuel`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("L'utilisateur n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur de groupe :", error);
      throw error;
    }
  };
  
  return getCurrentGroupe;
};

export const useGetGroupesUtilisateur = () => {
  const context = useContext(AuthContext);

  const getGroupesUtilisateur = async () => {
    try {
      const response = await fetch(`${API_URL}/membres/${context?.auth.idUser}/groupes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("L'utilisateur n'existe pas");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Erreur de groupe :", error);
      throw error;
    }
  };

  return getGroupesUtilisateur;
};