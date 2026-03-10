import { useState, useEffect } from "react";
import { useGetUser, useUpdatePwdUser, useUpdateUser } from "../services/membreService";

export type User = {
  nom: string;
  prenom: string;
  email: string;
};

export default function UpdateUserPage() {
  const [erreur, setErreur] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");

  const UpdateUser = useUpdateUser();
  const GetUser = useGetUser();
  const UpdatePwdUser = useUpdatePwdUser();


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resultatUser = await GetUser();
        console.log("réponse:", resultatUser);
        setNom(resultatUser.nom);
        setEmail(resultatUser.email);
        setPrenom(resultatUser.prenom);
      } catch (err) {
        setErreur("l'utilisateur n'existe pas");
      }
    };
    fetchUser();
  }, []);


  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErreur("");
      try {
        const resultat = await UpdateUser({ nom, prenom, email }) ;
        console.log("réponse:", resultat);
      } catch (err) {
        setErreur("Email déjà pris ou email invalide");
      }
      if(password){
        try {
          const resultat = await UpdatePwdUser(password);
          console.log("réponse PWD :", resultat);

        } catch (error) {
          setErreur("Mot de passe invalide");
        }
      }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erreur && (
        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
          {erreur}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Adresse Email
        </label>
        <input
          id="email"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="exemple.email@prefecture.fr"
        />
      </div>
      <div>
        <label
          htmlFor="prenom"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Prénom
        </label>
        <input
          id="prenom"
          type="text"
          required
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>
      <div>
        <label
          htmlFor="nom"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom
        </label>
        <input
          id="nom"
          type="text"
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type={"text"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="••••••••"
        />

      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-200"
      >
        Changer
      </button>
    </form>
  );
}
