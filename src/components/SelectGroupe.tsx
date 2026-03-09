import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGetCurrentGroupe, useGetGroupesUtilisateur } from "../services/membreService";

export default function SelectGroupe() {
  const context = useContext(AuthContext); 
  const [groupes, setGroupes] = useState<any[]>([]);

  const getCurrentGroupe = useGetCurrentGroupe();
  const getGroupesUtilisateur = useGetGroupesUtilisateur();

  useEffect(() => {
    const fetchDonnees = async () => {
      try {
        const listeGroupes = await getGroupesUtilisateur();
        setGroupes(listeGroupes);

        const groupeActuel = await getCurrentGroupe();
        
        if (groupeActuel && groupeActuel.id && !context?.groupeActifId) {
          context?.setGroupeActifId(groupeActuel.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des groupes:", error);
      }
    };

    fetchDonnees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    context?.setGroupeActifId(e.target.value);
  };

  return (
    <select
      value={context?.groupeActifId || ""}
      onChange={handleChange}
      className="p-2 border rounded text-black bg-white"
    >
      {!context?.groupeActifId && (
        <option value="" disabled>Sélectionnez un groupe</option>
      )}
      
      {groupes.map((groupe) => (
        <option key={groupe.id} value={groupe.id}>
          {groupe.nom}
        </option>
      ))}
    </select>
  );
}