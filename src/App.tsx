import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import "./index.css";
import DashboardPage from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import UpdateUserPage, { type User } from "./pages/UpdateUserPage";
import { UpdateGroupePage } from "./pages/UpdateGroupePage";
import SigninPage from "./pages/SigninPage";
import { AddGroupePage } from "./pages/AddGroupePage";
import AdminPage from "./pages/Adminpage";
import AdminRoute from "./components/AdminRoute";
import TutorialPage from "./pages/TutorialPage";
import { AuthContext } from "./context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useGetConfig } from "./services/configService";
import { useGetUser } from "./services/userService";

function App() {
  const context = useContext(AuthContext);
  const GetUser = useGetUser();
  const getconfig = useGetConfig();
  const [adresseAdmin, setAdresseAdmin] = useState("");
  useEffect(() => {
    const fetchConfig = async () => {
      const data = await getconfig();
      setAdresseAdmin(data.emailAdmin);
    };

    fetchConfig();
  }, []);
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const fetchUser = async () => {
      if (context?.auth.idUser && context.isLogged) {
        const user = await GetUser();
        setUser(user);
      }
    };
    fetchUser();
  }, [context?.auth.idUser]);
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-emerald-950 bg-[radial-gradient(circle_at_top,_#f0fdfa_0%,_#ccfbf1_100%)]">
      <BrowserRouter basename={basename}>

        <NavBar />
        <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Signin" element={<SigninPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage/>
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<TutorialPage />} />
          <Route
            path="/update-user"
            element={
              <ProtectedRoute>
                <UpdateUserPage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/update-group"
            element={
              <ProtectedRoute>
                <UpdateGroupePage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/add-group"
            element={
              <ProtectedRoute>
                <AddGroupePage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/admin"
            element={
              <AdminRoute
                userEmail={user?.email}
                adminEmailFromConfig={adresseAdmin}
              >
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
