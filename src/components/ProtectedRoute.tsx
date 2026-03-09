import { type ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const context = useContext(AuthContext);

  if (!context) return null;

  if (!context.isLogged) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};