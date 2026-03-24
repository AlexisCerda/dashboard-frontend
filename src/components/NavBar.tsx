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
    <nav className="bg-white/95 backdrop-blur border-b-2 border-slate-200 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.5)] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          <div className="flex items-center gap-6 min-w-0">
            <div className="hidden md:block">
              <div className="ml-2 flex items-baseline space-x-2">
                {context?.isLogged && (
                  <>
                    <Link
                      to="/dashboard"
                      className="hover:bg-slate-100 text-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Mon Tableau de Bord
                    </Link>
                  </>
                )}
                <Link
                  to="/help"
                  className="hover:bg-slate-100 text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Tutoriel
                </Link>
              </div>
            </div>

            {context?.isLogged && (
              <div className="hidden xl:flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 whitespace-nowrap">
                {user.nom} {user.prenom}
                {" · id : "}
                {user.id}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {context?.isLogged && emailAdmin === emailUser && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Administration"
              >
                <UserStar className="w-5 h-5" />
              </Link>
            )}
            {context?.isLogged && (
              <Link
                to="/update-user"
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Mon profil"
              >
                <UserCog className="w-5 h-5" />
              </Link>
            )}

            {context?.isLogged ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Déconnexion
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  Connexion
                </Link>
                <Link
                  to="/Signin"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
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
