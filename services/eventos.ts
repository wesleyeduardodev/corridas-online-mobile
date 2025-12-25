import api from './api';
import { ENDPOINTS } from '@/constants/api';

export type StatusEvento = 'ATIVO' | 'CANCELADO';

export interface Evento {
  id: number;
  nome: string;
  descricao?: string;
  data: string;
  horario?: string;
  local: string;
  cidade: string;
  cidadeIbge?: number;
  estado: string;
  estadoIbge?: number;
  inscricoesAbertas: boolean;
  limiteInscricoes?: number;
  trajetoUrl?: string;
  valorInscricao?: number;
  status: StatusEvento;
}

export interface CriarEventoRequest {
  nome: string;
  descricao?: string;
  data: string;
  horario?: string;
  local: string;
  cidade: string;
  cidadeIbge: number;
  estado: string;
  estadoIbge: number;
  inscricoesAbertas?: boolean;
  limiteInscricoes?: number;
  trajetoUrl?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  distanciaKm: number;
  valor: number;
  limiteVagas?: number;
  idadeMinima?: number;
  idadeMaxima?: number;
}

export interface CriarCategoriaRequest {
  nome: string;
  descricao?: string;
  distanciaKm: number;
  valor: number;
  limiteVagas?: number;
  idadeMinima?: number;
  idadeMaxima?: number;
}

export interface Inscricao {
  id: number;
  atletaNome: string;
  atletaEmail: string;
  atletaCpf: string;
  categoriaNome: string;
  categoriaId: number;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'CANCELADO_EVENTO';
  dataInscricao: string;
  numeroInscricao?: number;
}

export const eventosService = {
  listar: async (includeCancelados = false): Promise<Evento[]> => {
    const response = await api.get(ENDPOINTS.EVENTOS.BASE, {
      params: { includeCancelados },
    });
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Evento> => {
    const response = await api.get(`${ENDPOINTS.EVENTOS.BASE}/${id}`);
    return response.data;
  },

  criar: async (data: CriarEventoRequest): Promise<Evento> => {
    const response = await api.post(ENDPOINTS.EVENTOS.BASE, data);
    return response.data;
  },

  atualizar: async (id: number, data: CriarEventoRequest): Promise<Evento> => {
    const response = await api.put(`${ENDPOINTS.EVENTOS.BASE}/${id}`, data);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINTS.EVENTOS.BASE}/${id}`);
  },

  cancelar: async (id: number): Promise<Evento> => {
    const response = await api.patch(`${ENDPOINTS.EVENTOS.BASE}/${id}/cancelar`);
    return response.data;
  },

  reativar: async (id: number): Promise<Evento> => {
    const response = await api.patch(`${ENDPOINTS.EVENTOS.BASE}/${id}/reativar`);
    return response.data;
  },

  listarCategorias: async (eventoId: number): Promise<Categoria[]> => {
    const response = await api.get(ENDPOINTS.CATEGORIAS(eventoId));
    return response.data;
  },

  criarCategoria: async (eventoId: number, data: CriarCategoriaRequest): Promise<Categoria> => {
    const response = await api.post(ENDPOINTS.CATEGORIAS(eventoId), data);
    return response.data;
  },

  atualizarCategoria: async (eventoId: number, categoriaId: number, data: CriarCategoriaRequest): Promise<Categoria> => {
    const response = await api.put(`${ENDPOINTS.CATEGORIAS(eventoId)}/${categoriaId}`, data);
    return response.data;
  },

  excluirCategoria: async (eventoId: number, categoriaId: number): Promise<void> => {
    await api.delete(`${ENDPOINTS.CATEGORIAS(eventoId)}/${categoriaId}`);
  },

  listarInscricoes: async (eventoId: number): Promise<Inscricao[]> => {
    const response = await api.get(ENDPOINTS.INSCRICOES.ORGANIZADOR(eventoId));
    return response.data;
  },

  atualizarStatusInscricao: async (eventoId: number, inscricaoId: number, status: string): Promise<void> => {
    await api.patch(`${ENDPOINTS.INSCRICOES.ORGANIZADOR(eventoId)}/${inscricaoId}`, { status });
  },
};
