import { api } from './api';
import type { Viagem, ViagemForm } from '../types/viagem';

export const viagemService = {
  cadastrar: async (dados: ViagemForm): Promise<Viagem> => {
    const response = await api.post<Viagem>('/viagem', dados);
    return response.data;
  },

  listarTodas: async (): Promise<Viagem[]> => {
    const response = await api.get<Viagem[]>('/viagem');
    return response.data;
  },

  buscarPorId: async (numero: number): Promise<Viagem> => {
    const response = await api.get<Viagem>(`/viagem/${numero}`);
    return response.data;
  },

  atualizar: async (numero: number, dados: ViagemForm): Promise<Viagem> => {
    const response = await api.put<Viagem>(`/viagem/${numero}`, dados);
    return response.data;
  },

  excluir: async (numero: number): Promise<void> => {
    await api.delete(`/viagem/${numero}`);
  }
};