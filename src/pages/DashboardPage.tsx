import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SelectGroupe from '../components/SelectGroupe';
import { ButtonAdminGroupe } from '../components/ButtonAdminGroupe';

export default function DashboardPage() {
  const context = useContext(AuthContext);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mon Tableau de Bord</h1>
      
      <p className="mb-4 text-gray-600">
        Affichage des données pour le groupe ID :
        <span className="font-bold text-blue-600"> {context?.groupeActifId}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectGroupe/> <ButtonAdminGroupe/>
      </div>
    </div>
  );
}