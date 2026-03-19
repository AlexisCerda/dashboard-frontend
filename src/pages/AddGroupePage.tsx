import { useContext, useEffect, useState } from "react";
import { useCreateGroupe, useGetConfig, useGetGroupesUtilisateur } from "../services/membreService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function AddGroupePage(){

  const CreateGroupe = useCreateGroupe();
  const GetConfig = useGetConfig();
  const GetGroupe = useGetGroupesUtilisateur();
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");
  const [nombreGroupe, setNombreGroupe] = useState(0);
  const [maxGroupe, setMaxGroupe] = useState(0);

  useEffect(() => {
      const fetchUser = async () => {
        setNombreGroupe(0);
        try {
          const resultatGroupe = await GetGroupe();
          resultatGroupe.forEach(() => setNombreGroupe(nombreGroupe + 1));
        } catch (err) {
          setErreur("le groupes ou l'utilisateur n'existe pas");
        }
      };
      fetchUser();
    }, []);

  useEffect(() => {
      const fetchUser = async () => {
        try {
          const resultatConfig = await GetConfig();
          setMaxGroupe(resultatConfig.maxGroupes);
        } catch (err) {
          setErreur("l'utilisateur n'existe pas");
        }
      };
      fetchUser();
    }, []);

  const  handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");

    if (!context?.auth.idUser) {
      setErreur("Utilisateur non authentifié.");
      return;
    }
    
    if (nombreGroupe >= maxGroupe) {
      setErreur("Vous avez atteint le nombre maximum de groupes.");
      return;
    }
    try {
      await CreateGroupe(context.auth.idUser, nom);
      navigate("/dashboard");
    } catch {
      setErreur("Erreur lors de la création du groupe.");
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Créer un groupe</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {erreur && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {erreur}
            </div>
          )}
          <div>
            <label
              htmlFor="nom"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nom du groupe
            </label>
            <input
              id="nom"
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
              placeholder="SIDSIC"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md duration-200"
          >
            Créer un groupe
          </button>
        </form>
      </div>
    </div>
  );
}