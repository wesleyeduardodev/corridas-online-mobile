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
  // Buscar perfil do atleta
  buscarPerfilAtleta: async (): Promise<PerfilAtleta> => {
    const response = await api.get('/api/atleta/perfil');
    return response.data;
  },

  // Atualizar perfil do atleta
  atualizarPerfilAtleta: async (data: AtualizarPerfilAtletaRequest): Promise<PerfilAtleta> => {
    const response = await api.put('/api/atleta/perfil', data);
    return response.data;
  },

  // Buscar perfil do organizador
  buscarPerfilOrganizador: async (): Promise<PerfilOrganizador> => {
    const response = await api.get('/api/organizador/perfil');
    return response.data;
  },

  // Atualizar perfil do organizador
  atualizarPerfilOrganizador: async (data: AtualizarPerfilOrganizadorRequest): Promise<PerfilOrganizador> => {
    const response = await api.put('/api/organizador/perfil', data);
    return response.data;
  },

  // Alterar senha (para ambos)
  alterarSenha: async (data: AlterarSenhaRequest): Promise<void> => {
    await api.put('/api/auth/alterar-senha', data);
  },
};
