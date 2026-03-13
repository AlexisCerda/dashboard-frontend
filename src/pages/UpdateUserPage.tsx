import { useState, useEffect, useContext } from "react";
import { useDeleteUser, useGetUser, useUpdatePwdUser, useUpdateUser } from "../services/membreService";
import { TrashIcon } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmeModalProps";

export type User = {
  nom: string;
  prenom: string;
  email: string;
};

export default function UpdateUserPage() {
  const context = useContext(AuthContext); 
  const [erreur, setErreur] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const UpdateUser = useUpdateUser();
  const GetUser = useGetUser();
  const UpdatePwdUser = useUpdatePwdUser();
  const DeleteUser = useDeleteUser();

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

  async function handleLeave(userId: string) {
    try {
      console.log("Suppression du compte en cours d'envoi au serveur...");
      await DeleteUser(userId);
      context?.logout();
    } catch (error) {
      console.error("Erreur de suppression", error);
      setErreur("Impossible de supprimer le compte");
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErreur("");
      setMessage("Ajoute bien pris en compte !")

      if(password){
        try {
          const resultat = await UpdatePwdUser(password);
          console.log("réponse PWD :", resultat);
        } catch (error) {
          setErreur("Mot de passe invalide");
          return;
        }
      }

      try {
        const resultat = await UpdateUser({ nom, prenom, email });
        console.log("réponse:", resultat);
        if (resultat.token && context?.auth.idUser) {
          context.login(context.auth.idUser, resultat.token);
        }
      } catch (err) {
        setErreur("Email déjà pris ou email invalide");
        setMessage("");
      }
    };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {erreur && (
        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
          {erreur}
        </div>
      )}
      {message && (
        <div className="p-3 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200">
          {message}
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
    {context?.auth.idUser != null && (
      <>
        <button className="m-5" onClick={() => setIsModalOpen(true)}>
          <TrashIcon/>
        </button>
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            void handleLeave(String(context.auth.idUser));
          }}
          title="Supprimer le compte"
          message="Es-tu sûr de vouloir supprimer ton compte ?"
        />
      </>
    )}
    </>
    );
  }

