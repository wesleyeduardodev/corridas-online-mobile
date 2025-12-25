import api from './api';

export interface PerfilAtleta {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  dataNascimento: string;
  sexo: string;
}

export interface PerfilOrganizador {
  id: number;
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone?: string;
}

export interface AtualizarPerfilAtletaRequest {
  nome: string;
  telefone?: string;
}

export interface AtualizarPerfilOrganizadorRequest {
  nome: string;
  telefone?: string;
}

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export const perfilService = {
  buscarPerfilAtleta: async (): Promise<PerfilAtleta> => {
    const response = await api.get('/api/atleta/perfil');
    return response.data;
  },

  atualizarPerfilAtleta: async (data: AtualizarPerfilAtletaRequest): Promise<PerfilAtleta> => {
    const response = await api.put('/api/atleta/perfil', data);
    return response.data;
  },

  buscarPerfilOrganizador: async (): Promise<PerfilOrganizador> => {
    const response = await api.get('/api/organizador/perfil');
    return response.data;
  },

  atualizarPerfilOrganizador: async (data: AtualizarPerfilOrganizadorRequest): Promise<PerfilOrganizador> => {
    const response = await api.put('/api/organizador/perfil', data);
    return response.data;
  },

  alterarSenha: async (data: AlterarSenhaRequest): Promise<void> => {
    await api.put('/api/auth/alterar-senha', data);
  },
};
