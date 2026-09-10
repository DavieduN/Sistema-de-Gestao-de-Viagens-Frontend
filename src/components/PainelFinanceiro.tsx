import React, { useEffect, useMemo, useState } from 'react';
import { despesaService } from '../services/despesaService';
import type { ResumoFinanceiro, TipoDespesa, DespesaForm } from '../types/despesa';
import { formatarData, formatarMoeda, hojeISO } from '../utils/formatters';
import { mensagemErro } from '../utils/erros';

const FORM_VAZIO: DespesaForm = {
  dataDespesa: '',
  descricao: '',
  valor: '',
  tipoDespesaId: '',
};

interface Props {
  numeroViagem: number;
  /** true quando a viagem está Aprovada e o usuário logado é o solicitante */
  permiteLancamento: boolean;
  /** descrição da situação atual da viagem (para a mensagem quando não pode lançar) */
  situacao: string;
}

export function PainelFinanceiro({ numeroViagem, permiteLancamento, situacao }: Props) {
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [tipos, setTipos] = useState<TipoDespesa[]>([]);
  const [erro, setErro] = useState('');

  const [formData, setFormData] = useState<DespesaForm>(FORM_VAZIO);
  const [status, setStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'carregando' | null; mensagem: string }>({
    tipo: null,
    mensagem: '',
  });

  const carregarResumo = async () => {
    const dados = await despesaService.obterResumo(numeroViagem);
    setResumo(dados);
  };

  useEffect(() => {
    if (!numeroViagem) return;
    const carregar = async () => {
      try {
        const [, listaTipos] = await Promise.all([carregarResumo(), despesaService.listarTipos()]);
        setTipos(Array.isArray(listaTipos) ? listaTipos : []);
      } catch (error: any) {
        setErro(mensagemErro(error, 'Falha ao carregar as despesas.'));
      }
    };
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroViagem]);

  const subtotais = useMemo(() => {
    const mapa = new Map<string, number>();
    (resumo?.despesas || []).forEach((d) => {
      const chave = d.tipoDespesa?.descricao || 'Sem tipo';
      mapa.set(chave, (mapa.get(chave) || 0) + Number(d.valor));
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [resumo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      (name === 'tipoDespesaId' || name === 'valor') && value !== '' ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ tipo: null, mensagem: '' });

    if (formData.valor === '' || Number(formData.valor) <= 0) {
      setStatus({ tipo: 'erro', mensagem: 'O valor deve ser maior que zero.' });
      return;
    }
    if (formData.dataDespesa && formData.dataDespesa > hojeISO()) {
      setStatus({ tipo: 'erro', mensagem: 'A data da despesa não pode ser futura.' });
      return;
    }

    setStatus({ tipo: 'carregando', mensagem: 'Salvando despesa...' });
    try {
      await despesaService.registrar(numeroViagem, formData);
      await carregarResumo();
      setFormData(FORM_VAZIO);
      setStatus({ tipo: 'sucesso', mensagem: 'Despesa registrada com sucesso!' });
    } catch (error: any) {
      setStatus({ tipo: 'erro', mensagem: `Falha ao registrar: ${mensagemErro(error)}` });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', padding: '1.5rem', borderRadius: '8px' }}>
      <div className="details-label" style={{ marginBottom: '1rem' }}>Controle Financeiro</div>

      {erro && !resumo ? (
        <div className="alert error">{erro}</div>
      ) : !resumo ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando despesas...</p>
      ) : (
        <>
          {/* Resumo consolidado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total gasto</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{formatarMoeda(resumo.totalGasto)}</strong>
          </div>

          {subtotais.length > 0 && (
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {subtotais.map(([tipo, total]) => (
                <div key={tipo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{tipo}</span>
                  <span>{formatarMoeda(total)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Formulário */}
          {permiteLancamento ? (
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="details-label">Nova despesa</div>

              {status.tipo && status.tipo !== 'carregando' && (
                <div className={`alert ${status.tipo}`} style={{ margin: 0 }}>{status.mensagem}</div>
              )}

              <div className="form-group">
                <label htmlFor="dataDespesa">Data</label>
                <input type="date" id="dataDespesa" name="dataDespesa" className="form-control"
                  max={hojeISO()} value={formData.dataDespesa} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="tipoDespesaId">Tipo</label>
                <select id="tipoDespesaId" name="tipoDespesaId" className="form-control"
                  value={formData.tipoDespesaId} onChange={handleChange} required>
                  <option value="" disabled>Selecione o tipo</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>{t.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <input type="text" id="descricao" name="descricao" className="form-control"
                  placeholder="Ex: Diária de hotel" value={formData.descricao} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="valor">Valor gasto (R$)</label>
                <input type="number" id="valor" name="valor" className="form-control"
                  step="0.01" min="0.01" placeholder="0,00" value={formData.valor} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn-primary" style={{ margin: 0 }} disabled={status.tipo === 'carregando'}>
                {status.tipo === 'carregando' ? 'Salvando...' : 'Registrar despesa'}
              </button>
            </form>
          ) : (
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {situacao === 'Aprovada'
                ? 'Apenas o solicitante da viagem pode registrar despesas.'
                : 'Só é possível registrar despesas em viagens aprovadas.'}
            </p>
          )}

          {/* Lista */}
          <div className="details-label" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Despesas lançadas</div>
          {resumo.despesas.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma despesa registrada.</p>
          ) : (
            <div className="table-container">
              <table className="table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.despesas.map((d) => (
                    <tr key={d.id}>
                      <td>{formatarData(d.dataDespesa)}</td>
                      <td>{d.tipoDespesa?.descricao}</td>
                      <td>{d.descricao}</td>
                      <td style={{ textAlign: 'right' }}>{formatarMoeda(d.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
