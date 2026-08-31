export interface ViagemForm {
  destino: string;
  dataSaida: string;
  dataRetorno: string;
  motivo: string;
  meioTransporte: string;
  empregadoMatricula: string;
}

export interface Empregado {
  matricula: string;
  nome: string;
  area: string;
}

export interface Viagem {
  numero: number;
  destino: string;
  dataSaida: string;
  dataRetorno: string;
  motivo: string;
  meioTransporte: string;
  situacao: string;
  empregado: Empregado;
}