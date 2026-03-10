import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGetCurrentGroupe, useGetGroupesUtilisateur, usePatchCurrentGroupe } from "../services/membreService";

export default function SelectGroupe() {
  const context = useContext(AuthContext); 
  const [groupes, setGroupes] = useState<any[]>([]);

  const getCurrentGroupe = useGetCurrentGroupe();
  const getGroupesUtilisateur = useGetGroupesUtilisateur();
  const patchCurrentGroupe = usePatchCurrentGroupe();

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

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    context?.setGroupeActifId(selectedValue);

    try {
      await patchCurrentGroupe(Number(selectedValue));
    } catch (error) {
      console.error("Erreur lors de la mise a jour du groupe actif:", error);
    }
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