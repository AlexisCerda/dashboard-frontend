import { useState } from "react";
import { useCreateUser } from "../services/membreService";
import { useNavigate } from "react-router-dom";

export type User = {
  nom: string;
  prenom: string;
  email: string;
};

export default function SigninPage() {
  const [erreur, setErreur] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");

  const CreateUser= useCreateUser();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErreur("");
      try {
        const resultat = await CreateUser(password,{ nom, prenom, email }) ;
        console.log("réponse:", resultat);
        navigate("/login");
      } catch (error) {
        setErreur("Email invalide, ou déjà prise");
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Créer un compte</h1>
        </div>

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
              Adresse Email
            </label>
            <input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
              placeholder="exemple.email@prefecture.fr"
            />
          </div>
          <div>
            <label
              htmlFor="prenom"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Prénom
            </label>
            <input
              id="prenom"
              type="text"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="nom"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nom
            </label>
            <input
              id="nom"
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
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
              type={"text"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
              placeholder="••••••••"
            />

          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md duration-200"
          >
            M'inscrire
          </button>
        </form>
      </div>
    </div>
  );
}
