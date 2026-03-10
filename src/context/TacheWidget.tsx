import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


interface WidgetTachesProps {
  groupeId: string;
}

export default function WidgetTaches({ groupeId }: WidgetTachesProps) {
  const [taches, setTaches] = useState<any[]>([]);

  const fetchTaches = async () => {
    try {
      console.log(`[REST] Je récupère les tâches fraîches du groupe ${groupeId} en BDD...`);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches", error);
    }
  };

  useEffect(() => {
    fetchTaches();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
      onConnect: () => {
        console.log(`🟢 Connecté à la radio du serveur !`);
        
        const frequence = `/topic/groupe/${groupeId}`;
        
        stompClient.subscribe(frequence, (message) => {
          if (message.body === 'REFRESH_TACHES') {
            console.log(`⚡ Alerte reçue sur ${frequence} ! Mise à jour invisible en cours...`);
            fetchTaches();
          }
        });
      },
      onDisconnect: () => {
        console.log('🔴 Déconnecté de la radio.');
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };

  }, [groupeId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Tâches du groupe {groupeId}</h2>
      
      <ul className="space-y-2">
        {taches.length === 0 ? (
          <p className="text-gray-500 italic">Aucune tâche ou chargement...</p>
        ) : (
          taches.map(tache => (
            <li key={tache.id} className="p-3 bg-slate-50 rounded border">
              {tache.titre}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}