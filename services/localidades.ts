import api from './api';
import { ENDPOINTS } from '@/constants/api';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export const localidadesService = {
  listarEstados: async (): Promise<Estado[]> => {
    const response = await api.get(ENDPOINTS.LOCALIDADES.ESTADOS);
    return response.data;
  },

  listarCidades: async (uf: string): Promise<Cidade[]> => {
    const response = await api.get(ENDPOINTS.LOCALIDADES.CIDADES(uf));
    return response.data;
  },
};
