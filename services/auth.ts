import api from './api';
import { ENDPOINTS } from '@/constants/api';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZADOR' | 'ATLETA';
  nome: string;
}

export interface RegistroOrganizadorRequest {
  nome: string;
  email: string;
  senha: string;
  cpfCnpj: string;
  telefone?: string;
}

export interface RegistroAtletaRequest {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone?: string;
  dataNascimento: string;
  sexo: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  registrarOrganizador: async (data: RegistroOrganizadorRequest): Promise<LoginResponse> => {
    const response = await api.post(ENDPOINTS.AUTH.REGISTRO_ORGANIZADOR, data);
    return response.data;
  },

  registrarAtleta: async (data: RegistroAtletaRequest): Promise<LoginResponse> => {
    const response = await api.post(ENDPOINTS.AUTH.REGISTRO_ATLETA, data);
    return response.data;
  },
};
