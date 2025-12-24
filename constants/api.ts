export const API_URL = 'https://0cf75cb56bdc.ngrok-free.app';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTRO_ORGANIZADOR: '/api/auth/registro/organizador',
    REGISTRO_ATLETA: '/api/auth/registro/atleta',
  },
  EVENTOS: {
    BASE: '/api/eventos',
    PUBLICOS: '/api/public/eventos',
  },
  CATEGORIAS: (eventoId: number) => `/api/eventos/${eventoId}/categorias`,
  CATEGORIAS_PUBLICAS: (eventoId: number) => `/api/public/eventos/${eventoId}/categorias`,
  INSCRICOES: {
    ATLETA: '/api/atleta/inscricoes',
    INSCREVER: (eventoId: number) => `/api/atleta/eventos/${eventoId}/inscricoes`,
    ORGANIZADOR: (eventoId: number) => `/api/eventos/${eventoId}/inscricoes`,
  },
  LOCALIDADES: {
    ESTADOS: '/api/public/localidades/estados',
    CIDADES: (uf: string) => `/api/public/localidades/estados/${uf}/cidades`,
  },
};
