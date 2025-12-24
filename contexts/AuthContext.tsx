import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService, LoginRequest, LoginResponse, RegistroOrganizadorRequest, RegistroAtletaRequest } from '@/services/auth';

interface User {
  email: string;
  nome: string;
  role: 'ADMIN' | 'ORGANIZADOR' | 'ATLETA';
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signed: boolean;
  login: (data: LoginRequest) => Promise<void>;
  registrarOrganizador: (data: RegistroOrganizadorRequest) => Promise<void>;
  registrarAtleta: (data: RegistroAtletaRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthResponse(response: LoginResponse) {
    const userData: User = {
      email: response.email,
      nome: response.nome,
      role: response.role,
    };

    await SecureStore.setItemAsync('token', response.token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));

    setUser(userData);
  }

  async function login(data: LoginRequest) {
    const response = await authService.login(data);
    await handleAuthResponse(response);
  }

  async function registrarOrganizador(data: RegistroOrganizadorRequest) {
    const response = await authService.registrarOrganizador(data);
    await handleAuthResponse(response);
  }

  async function registrarAtleta(data: RegistroAtletaRequest) {
    const response = await authService.registrarAtleta(data);
    await handleAuthResponse(response);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signed: !!user,
        login,
        registrarOrganizador,
        registrarAtleta,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
