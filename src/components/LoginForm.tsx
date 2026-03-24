import { useState, useContext } from "react";
import { loginAgent } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erreur, setErreur] = useState("");

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");
    try {
      const resultat = await loginAgent(email, password);
      const idUser = resultat.utilisateur?.id ?? resultat.utilisateur?.idUser ?? resultat.utilisateur?.idMembre;
      if(authContext && resultat.token && idUser){
        authContext.login(idUser, resultat.token);
        navigate("/dashboard");
      } else {
        console.error("Champ ID introuvable dans la réponse:", resultat.utilisateur);
        setErreur("Erreur de connexion : réponse serveur invalide.");
      }
    } catch (err) {
      setErreur("Identifiants incorrects ou serveur injoignable.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erreur && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {erreur}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Adresse Email ou Identifiant
        </label>
        <input
          id="email"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
          placeholder="jean.dupont@prefecture.fr"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
          placeholder="••••••••"
        />

        <div className="flex items-center mt-3">
          <input
            id="showPassword"
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-300 border-slate-300 rounded cursor-pointer"
          />
          <label
            htmlFor="showPassword"
            className="ml-2 block text-sm text-slate-600 cursor-pointer select-none"
          >
            Afficher le mot de passe
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md duration-200"
      >
        Se connecter
      </button>
    </form>
  );
}
