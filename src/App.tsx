import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import './index.css';
import DashboardPage from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import UpdateUserPage from './pages/UpdateUserPage';
import { UpdateGroupePage } from './pages/UpdateGroupePage';
import SigninPage from './pages/SigninPage';




function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path='/Signin' element={<SigninPage/>}/>
        <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute> } />
        <Route path='/help'></Route>
        <Route path='/update-user' element={
          <ProtectedRoute>
            <UpdateUserPage/>
          </ProtectedRoute>
        }></Route>
        <Route path='/update-group' element={
          <ProtectedRoute>
            <UpdateGroupePage/>
          </ProtectedRoute>
        }></Route>
        <Route path='*' element={
          <ProtectedRoute>
            <DashboardPage/>
          </ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;