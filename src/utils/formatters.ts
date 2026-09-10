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

export function formatarMoeda(valor: number | string): string {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  return (Number.isFinite(numero) ? numero : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Data de hoje no formato YYYY-MM-DD respeitando o fuso local (para max do <input type="date">).
export function hojeISO(): string {
  const agora = new Date();
  const offsetMs = agora.getTimezoneOffset() * 60000;
  return new Date(agora.getTime() - offsetMs).toISOString().split('T')[0];
}