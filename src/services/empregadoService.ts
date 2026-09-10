import { api } from './api';
import type { Empregado, EmpregadoForm, Cargo, Area } from '../types/viagem';

export const empregadoService = {
  listarCargos: async (): Promise<Cargo[]> => {
    const response = await api.get<Cargo[]>('/cargo');
    return response.data;
  },

  listarAreas: async (): Promise<Area[]> => {
    const response = await api.get<Area[]>('/area');
    return response.data;
  },

  cadastrar: async (dados: EmpregadoForm): Promise<Empregado> => {
    const response = await api.post<Empregado>('/empregado', dados);
    return response.data;
  },

  buscarPorMatricula: async (matricula: string): Promise<Empregado> => {
    const response = await api.get<Empregado>(`/empregado/${matricula}`);
    return response.data;
  },
};
