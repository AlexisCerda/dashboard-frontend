import { createContext, useState, type ReactNode } from 'react';

interface AuthState {
  idUser: number | null;
  token?: string | null;
}

interface AuthContextType {
  auth: AuthState;
  login: (idUser: number, token: string) => void;
  logout: () => void;
  isLogged: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem('sidsic_token');
    const savedId = localStorage.getItem('sidsic_idUser');
    
    return {
      token: savedToken ? savedToken : null,
      idUser: savedId ? parseInt(savedId) : null,
    };
  });
  const isLogged = auth.token !== null;

  const login = (idUser: number, token: string) => {
    setAuth({ idUser });
    localStorage.setItem('sidsic_token', token);
    localStorage.setItem('sidsic_idUser', idUser.toString());
  };

  const logout = () => {
    setAuth({ idUser: null, token: null });
    localStorage.removeItem('sidsic_token');
    localStorage.removeItem('sidsic_idUser');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLogged }}>
      {children}
    </AuthContext.Provider>
  );
};