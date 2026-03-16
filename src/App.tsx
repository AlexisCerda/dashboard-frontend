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
import { AuthContext } from "./context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useGetUser } from "./services/membreService";

function App() {
  const context = useContext(AuthContext);
  const GetUser = useGetUser();
  const configServeur = {
    emailAdmin: "alexis@",
  };

  const [user, setUser] = useState<User>();
  useEffect(() => {
    const fetchUser = async () => {
      if (context?.auth.idUser) {
        const user = await GetUser();
        setUser(user);
      }
    };
    fetchUser();
  }, [context?.auth.idUser]);
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Signin" element={<SigninPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/help"></Route>
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
                adminEmailFromConfig={configServeur.emailAdmin}
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
      </BrowserRouter>
    </div>
  );
}

export default App;
