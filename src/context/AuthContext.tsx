import { createContext, useState, type ReactNode } from 'react';

const normalizeStoredToken = (token: string | null): string | null => {
  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  return token;
};

interface AuthState {
  idUser: number | null;
  token?: string | null;
}

interface AuthContextType {
  auth: AuthState;
  login: (idUser: number, token: string) => void;
  logout: () => void;
  isLogged: boolean;
  groupeActifId: string;
  setGroupeActifId: (id:string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedToken = normalizeStoredToken(localStorage.getItem('sidsic_token'));
    const savedId = localStorage.getItem('sidsic_idUser');
    
    return {
      token: savedToken ? savedToken : null,
      idUser: savedId ? parseInt(savedId) : null,
    };
  });
  const isLogged = !!auth.token;

  const login = (idUser: number, token: string) => {
    setAuth({ idUser, token });
    localStorage.setItem('sidsic_token', token);
    localStorage.setItem('sidsic_idUser', idUser.toString());
  };

  const logout = () => {
    setAuth({ idUser: null, token: null });
    localStorage.removeItem('sidsic_token');
    localStorage.removeItem('sidsic_idUser');
    localStorage.removeItem('sidsic_groupeActifId');
    setGroupeActifIdState("");
  };

  const [groupeActifId, setGroupeActifIdState] = useState<string>(
    () => localStorage.getItem('sidsic_groupeActifId') ?? ""
  );

  const setGroupeActifId = (id: string) => {
    localStorage.setItem('sidsic_groupeActifId', id);
    setGroupeActifIdState(id);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLogged,groupeActifId, setGroupeActifId }}>
      {children}
    </AuthContext.Provider>
  );
};