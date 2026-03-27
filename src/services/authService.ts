import { apiFetch } from "./apiConfig";

export const loginAgent = async (email: string, motDePasse: string) => {
  try {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        motDePasse: motDePasse
      }),
    });

    if (!response.ok) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("sidsic_token", data.token);
    }

    return { utilisateur: data.utilisateur, token: data.token };

  } catch (error) {
    console.error("Erreur de connexion :", error);
    throw error;
  }
};