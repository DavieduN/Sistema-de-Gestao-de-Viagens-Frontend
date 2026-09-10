import { api } from './api';
import type { TipoDespesa, Despesa, DespesaForm, ResumoFinanceiro } from '../types/despesa';

export const despesaService = {
  listarTipos: async (): Promise<TipoDespesa[]> => {
    const response = await api.get<TipoDespesa[]>('/tipo-despesa');
    return response.data;
  },

  registrar: async (numeroViagem: number, dados: DespesaForm): Promise<Despesa> => {
    const response = await api.post<Despesa>(`/viagem/${numeroViagem}/despesa`, dados);
    return response.data;
  },

  obterResumo: async (numeroViagem: number): Promise<ResumoFinanceiro> => {
    const response = await api.get<ResumoFinanceiro>(`/viagem/${numeroViagem}/despesa/resumo`);
    return response.data;
  },
};
