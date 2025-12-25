export const API_URL = 'https://69a921ab5993.ngrok-free.app';

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
  TRAJETO: {
    BASE: (eventoId: number) => `/api/eventos/${eventoId}/trajeto`,
    DISTANCIA: (eventoId: number) => `/api/eventos/${eventoId}/trajeto/distancia`,
    PUBLICO: (eventoId: number) => `/api/public/eventos/${eventoId}/trajeto`,
  },
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
