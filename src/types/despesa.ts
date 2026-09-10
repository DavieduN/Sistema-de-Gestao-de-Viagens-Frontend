export interface TipoDespesa {
  id: number;
  descricao: string;
}

export interface Despesa {
  id: number;
  dataDespesa: string;
  descricao: string;
  valor: number;
  tipoDespesa: TipoDespesa;
}

export interface DespesaForm {
  dataDespesa: string;
  descricao: string;
  valor: number | '';
  tipoDespesaId: number | '';
}

export interface ResumoFinanceiro {
  numeroViagem: number;
  destino: string;
  totalGasto: number;
  despesas: Despesa[];
}
