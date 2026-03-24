const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";


export const loginAgent = async (email: string, motDePasse: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
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