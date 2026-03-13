import { useContext, useState } from "react";
import { useCreateGroupe } from "../services/membreService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function AddGroupePage(){

  const CreateGroupe = useCreateGroupe();
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");

  const  handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");

    if (!context?.auth.idUser) {
      setErreur("Utilisateur non authentifié.");
      return;
    }

    try {
      await CreateGroupe(context.auth.idUser, nom);
      navigate("/dashboard");
    } catch {
      setErreur("Erreur lors de la création du groupe.");
    }
  }
  return <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {erreur && (
        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
          {erreur}
        </div>
      )}
      <div>
        <label
          htmlFor="nom"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom du groupe
        </label>
        <input
          id="nom"
          type="text"
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="SIDSIC"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-200"
      >
        Créer un groupe
      </button>
    </form>
  </>;
}