import { api } from './api';
import type { Viagem, ViagemForm, Motivo, MeioTransporte, AvaliacaoForm, HistoricoViagem } from '../types/viagem';

export const viagemService = {
  listarMotivos: async (): Promise<Motivo[]> => {
    const response = await api.get<Motivo[]>('/motivo');
    return response.data;
  },

  listarMeiosTransporte: async (): Promise<MeioTransporte[]> => {
    const response = await api.get<MeioTransporte[]>('/meio-transporte');
    return response.data;
  },

  cadastrar: async (dados: ViagemForm): Promise<Viagem> => {
    const response = await api.post<Viagem>('/viagem', dados);
    return response.data;
  },

  listarTodas: async (): Promise<Viagem[]> => {
    const response = await api.get<Viagem[]>('/viagem');
    return response.data;
  },

  listarMinhasViagens: async (): Promise<Viagem[]> => {
    const response = await api.get<Viagem[]>('/viagem/empregado');
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
  },

  submeterParaAnalise: async (numero: number): Promise<void> => {
    await api.patch(`/viagem/${numero}/solicitar`);
  },

  avaliarViagem: async (numero: number, dados: AvaliacaoForm): Promise<void> => {
    await api.patch(`/viagem/${numero}/avaliar`, dados);
  },

  listarHistorico: async (numeroViagem: number): Promise<HistoricoViagem[]> => {
    const response = await api.get<HistoricoViagem[]>(`/historico-viagem/viagem/${numeroViagem}`);
    return response.data;
  }
};