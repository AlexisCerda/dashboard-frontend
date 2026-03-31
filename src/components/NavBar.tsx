import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserCog, UserStar } from "lucide-react";
import { useGetConfig } from "../services/configService";
import { useGetUser } from "../services/userService";

type UserDTO = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
};

export default function NavBar() {
  const context = useContext(AuthContext);
  const getConfig = useGetConfig();
  const GetUser = useGetUser();

  const [emailAdmin, setEmailAdmin] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const [user, setUser] = useState<UserDTO>({
    id: 0,
    nom: "",
    prenom: "",
    email: "",
  });
  const navigate = useNavigate();
  const handleLogout = () => {
    context?.logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (context?.isLogged) {
        const resultatUser = await GetUser();
        setEmailUser(resultatUser.email);
        setUser(resultatUser);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    getConfig().then((data) => {
      setEmailAdmin(data.emailAdmin);
    });
  }, []);

  return (
    <nav className="sticky top-0 bg-emerald-800/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_20px_-12px_rgba(6,78,59,0.4)] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          <div className="flex items-center gap-6 min-w-0">
            <div className="hidden md:block">
              <div className="ml-2 flex items-baseline space-x-2">
                {context?.isLogged && (
                  <>
                    <Link
                      to="/dashboard"
                      className="hover:bg-emerald-700/60 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    >
                      Mon Tableau de Bord
                    </Link>
                  </>
                )}
                <Link
                  to="/help"
                  className="hover:bg-emerald-700/60 text-emerald-50 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  Tutoriel
                </Link>
              </div>
            </div>

            {context?.isLogged && (
              <div className="hidden xl:flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-emerald-100 whitespace-nowrap backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                {user.nom} {user.prenom}
                <span className="mx-2 text-emerald-600/50">|</span>
                id : {user.id}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {context?.isLogged && emailAdmin === emailUser && (
              <Link
                to="/admin"
                className="flex items-center gap-2 p-2.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-xl transition-all duration-200"
                title="Administration"
              >
                <UserStar className="w-5 h-5" />
              </Link>
            )}
            {context?.isLogged && (
              <Link
                to="/update-user"
                className="flex items-center gap-2 p-2.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-xl transition-all duration-200"
                title="Mon profil"
              >
                <UserCog className="w-5 h-5" />
              </Link>
            )}

            {context?.isLogged ? (
              <button
                onClick={handleLogout}
                className="bg-white/10 text-white border border-white/20 hover:bg-rose-500 hover:border-rose-400 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95"
              >
                Déconnexion
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
                >
                  Connexion
                </Link>
                <Link
                  to="/Signin"
                  className="bg-emerald-700/50 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors active:scale-95"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
