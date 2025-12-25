import api from './api';
import { ENDPOINTS } from '@/constants/api';

export interface InscricaoAtleta {
  id: number;
  eventoId: number;
  eventoNome: string;
  eventoData: string;
  eventoLocal: string;
  eventoCidade: string;
  eventoEstado: string;
  categoriaId: number;
  categoriaNome: string;
  categoriaDistanciaKm: number;
  valor: number;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  dataInscricao: string;
  numeroInscricao?: number;
  valorPago?: number;
}

export interface RealizarInscricaoRequest {
  categoriaId: number;
}

export const inscricoesService = {
  minhasInscricoes: async (): Promise<InscricaoAtleta[]> => {
    const response = await api.get(ENDPOINTS.INSCRICOES.ATLETA);
    return response.data;
  },

  inscrever: async (eventoId: number, data: RealizarInscricaoRequest): Promise<InscricaoAtleta> => {
    const response = await api.post(ENDPOINTS.INSCRICOES.INSCREVER(eventoId), data);
    return response.data;
  },

  cancelar: async (inscricaoId: number): Promise<void> => {
    await api.delete(`${ENDPOINTS.INSCRICOES.ATLETA}/${inscricaoId}`);
  },

  buscarPorId: async (inscricaoId: number): Promise<InscricaoAtleta> => {
    const response = await api.get(`${ENDPOINTS.INSCRICOES.ATLETA}/${inscricaoId}`);
    return response.data;
  },
};
