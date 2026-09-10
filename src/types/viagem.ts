export interface Situacao {
  id: number;
  descricao: string;
}

export interface Motivo {
  id: number;
  descricao: string;
}

export interface MeioTransporte {
  id: number;
  descricao: string;
}

export interface Cargo {
  id: number;
  nome: string;
}

export interface Area {
  id: number;
  nome: string;
}

export interface Empregado {
  matricula: string;
  nome: string;
  cargo: Cargo;
  area: Area;
}

export interface EmpregadoForm {
  matricula: string;
  senha: string;
  nome: string;
  cargoId: number | '';
  areaId: number | '';
}

export interface ViagemForm {
  destino: string;
  dataSaida: string;
  dataRetorno: string;
  motivoId: number | ''; 
  meioTransporteId: number | ''; 
}

export interface AvaliacaoForm {
  acao: 'Aprovada' | 'Rejeitada' | 'Ajustes Solicitados';
  comentario: string;
}

export interface Viagem {
  numero: number;
  destino: string;
  dataSaida: string;
  dataRetorno: string;
  motivo: Motivo;
  meioTransporte: MeioTransporte;
  situacao: Situacao;
  solicitante: Empregado;
  cargoSnapshot?: Cargo;
  areaSnapshot?: Area;
}

export interface HistoricoViagem {
  id: number;
  situacao: { descricao: string };
  responsavel: { nome: string; matricula: string };
  dataHora: string;
  comentario: string;
}