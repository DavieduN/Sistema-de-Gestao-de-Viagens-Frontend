export interface ViagemForm {
  destino: string;
  dataSaida: string;
  dataRetorno: string;
  motivo: string;
  meioTransporte: string;
  empregadoMatricula: string;
}

export interface Viagem extends ViagemForm {
  numero: number;
  situacao: string;
}