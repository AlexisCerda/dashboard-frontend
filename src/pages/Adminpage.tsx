import { useState, useEffect } from "react";
import { useGetConfig } from "../services/membreService";

export default function AdminPage() {
  const getConfig = useGetConfig();

  const [emailAdmin, setEmailAdmin] = useState("");
  const [maxTaches, setMaxTaches] = useState(10);
  const [maxGroupes, setMaxGroupes] = useState(3);

  useEffect(() => {
    getConfig().then(data => { setEmailAdmin(data.emailAdmin);
      setMaxTaches(data.maxTaches);
      setMaxGroupes(data.maxGroupes);
    })
  }, []);

  const handleSauvegarder = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    const nouvelleConfig = { emailAdmin, maxTaches, maxGroupes };
    console.log("Envoi de la nouvelle config au serveur...", nouvelleConfig);
    
    try {
      // await fetch("http://localhost:8080/api/config", { method: "PUT", body: JSON.stringify(nouvelleConfig), headers: ... })
      alert("Configuration mise à jour avec succès !");
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Panneau d'Administration </h1>
      
      <form onSubmit={handleSauvegarder} className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email de l'Administrateur</label>
          <input 
            type="email" 
            value={emailAdmin}
            onChange={(e) => setEmailAdmin(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre maximum de tâches par agent</label>
          <input 
            type="number" 
            value={maxTaches}
            onChange={(e) => setMaxTaches(Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre maximum de groupes par agent</label>
          <input 
            type="number" 
            value={maxGroupes}
            onChange={(e) => setMaxGroupes(Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <button 
          type="submit" 
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sauvegarder les modifications
        </button>
      </form>
    </div>
  );
}