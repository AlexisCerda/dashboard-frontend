import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SelectGroupe from './SelectGroupe';

export default function NavBar() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    context?.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-300 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">


          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {context?.isLogged && (
                <>
                  <Link to="/dashboard" className="hover:bg-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                    Mon Tableau de Bord
                  </Link>
                  <SelectGroupe/>
                </>
              )}
              <Link to="/help" className="hover:bg-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                Tutoriel
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {context?.isLogged ? (
              <>
                <button onClick={handleLogout}
                  className="bg-red-700 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Déconnexion </button> </>) 
            : (
              <Link to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Connexion </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}