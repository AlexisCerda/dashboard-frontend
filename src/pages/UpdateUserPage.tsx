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
        } catch (error) {
          setErreur("Mot de passe invalide");
          return;
        }
      }

      try {
        const resultat = await UpdateUser({ nom, prenom, email });
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Mon profil</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {erreur && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {erreur}
            </div>
          )}
          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">
              {message}
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
            Changer
          </button>
        </form>
        {context?.auth.idUser != null && (
          <button className="mt-5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors" onClick={() => setIsModalOpen(true)}>
            <span className="inline-flex items-center gap-2"><TrashIcon/> Supprimer le compte</span>
          </button>
        )}
      </div>
    </div>
    {context?.auth.idUser != null && (
      <>
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

