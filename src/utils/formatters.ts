export function formatarData(dataString: string): string {
  if (!dataString) return '';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(dataString: string): string {
  if (!dataString) return '';
  const data = new Date(dataString);
  return data.toLocaleString('pt-BR');
}