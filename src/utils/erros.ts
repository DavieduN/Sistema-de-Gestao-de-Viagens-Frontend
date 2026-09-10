// Extrai uma mensagem legível das respostas de erro da API.
// A API responde ou { status, erro } (regras de negócio / ResponseStatusException)
// ou um array [{ campo, mensagem }] (validação de campos do Bean Validation).
export function mensagemErro(error: any, fallback = 'Erro ao comunicar com o servidor.'): string {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (Array.isArray(data)) {
    const msgs = data.map((e: any) => e?.mensagem || e?.message).filter(Boolean);
    return msgs.length ? msgs.join(' • ') : fallback;
  }

  return data.erro || data.message || fallback;
}
