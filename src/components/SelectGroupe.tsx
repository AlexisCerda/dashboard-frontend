import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGetCurrentGroupe, useGetGroupesUtilisateur, usePatchCurrentGroupe } from "../services/membreService";

export default function SelectGroupe() {
  const context = useContext(AuthContext); 
  const [groupes, setGroupes] = useState<any[]>([]);
  const [isGroupesLoaded, setIsGroupesLoaded] = useState(false);

  const getCurrentGroupe = useGetCurrentGroupe();
  const getGroupesUtilisateur = useGetGroupesUtilisateur();
  const patchCurrentGroupe = usePatchCurrentGroupe();

  useEffect(() => {
    const fetchDonnees = async () => {
      try {
        const listeGroupes = await getGroupesUtilisateur();
        setGroupes(listeGroupes);

        try {
          const groupeActuel = await getCurrentGroupe();

          if (groupeActuel && groupeActuel.id && !context?.groupeActifId) {
            context?.setGroupeActifId(String(groupeActuel.id));
          }
        } catch {
          // Cas normal: l'utilisateur peut ne pas avoir de groupe actif.
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des groupes:", error);
      } finally {
        setIsGroupesLoaded(true);
      }
    };

    fetchDonnees();
  }, []);

  // Vérifier que le groupe actif existe toujours dans la liste
  useEffect(() => {
    if (!isGroupesLoaded) {
      return;
    }

    const groupeExists = groupes.some((g) => String(g.id) === context?.groupeActifId);
    if (!groupeExists) {
      // Le groupe actif n'existe plus, sélectionner le premier de la liste
      if (groupes.length > 0) {
        context?.setGroupeActifId(String(groupes[0].id));
        ChangeGroupe(groupes[0].id);
      } else {
        // Aucun groupe disponible
        context?.setGroupeActifId("");
      }
    }
  }, [groupes, context?.groupeActifId, context, isGroupesLoaded]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    context?.setGroupeActifId(selectedValue);

    try {
      await patchCurrentGroupe(Number(selectedValue));
    } catch (error) {
      console.error("Erreur lors de la mise a jour du groupe actif:", error);
    }
  };
  const ChangeGroupe = async (groupeId : number) => {
    context?.setGroupeActifId(String(groupeId));
    console.log("voici la valeur changé" + groupeId);
    
    try {
      await patchCurrentGroupe(groupeId);
      
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