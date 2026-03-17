import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dog, SquarePlus, UserCog, UserStar } from 'lucide-react';
import { useGetConfig, useGetUser } from '../services/membreService';

export default function NavBar() {
  const context = useContext(AuthContext);
  const getConfig = useGetConfig();
  const GetUser = useGetUser();

  const [emailAdmin, setEmailAdmin] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const navigate = useNavigate();
  const handleLogout = () => {
    context?.logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const resultatUser = await GetUser();
      setEmailUser(resultatUser.email);
    };
    fetchUser();
  }, []);

  useEffect(() => {
      getConfig().then(data => { setEmailAdmin(data.emailAdmin);})
    }, []);
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
              <div>
              <Link to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Connexion </Link>
              <Link to="/Signin"
              className=" m-5 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Inscription
              </Link>
              </div>
            )}
          </div>
          <div>
            {context?.isLogged&&emailAdmin === emailUser &&(
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors 2xl:border-t-8">
                <UserStar className="w-5 h-5" />
              </Link>
            )}
          </div>          
          <div>
            {context?.isLogged &&(
              
              <Link
                to="/update-user"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors 2xl:border-t-8">
                <UserCog className="w-5 h-5" />
              </Link>
            )}
          </div>
          
          
        </div>
      </div>
    </nav>
  );
}