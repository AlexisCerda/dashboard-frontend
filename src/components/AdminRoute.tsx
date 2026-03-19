import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: JSX.Element;
  userEmail: string | undefined;
  adminEmailFromConfig: string;
}

export default function AdminRoute({ children, userEmail, adminEmailFromConfig }: AdminRouteProps) {
  
  if (!userEmail || !adminEmailFromConfig) {
    return <div>Chargement de la sécurité...</div>;
  }  
  if (userEmail !== adminEmailFromConfig) {
    console.warn("Accès refusé : Vous n'êtes pas l'administrateur.");
    return <Navigate to="/dashboard" replace />; 
  }

  return children;
}