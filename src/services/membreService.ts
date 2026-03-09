import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:8080/api";
const context = useContext(AuthContext);

export const loginAgent = async (email: string, motDePasse: string) => {
  try {
    const response = await fetch(`${API_URL}/membres${context?.auth.idUser}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        motDePasse: motDePasse
      }),
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
}