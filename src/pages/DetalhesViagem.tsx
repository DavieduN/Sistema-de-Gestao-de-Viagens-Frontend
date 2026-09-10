import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { viagemService } from '../services/viagemService';
import type { Viagem } from '../types/viagem';
import type { HistoricoViagem } from '../types/viagem';
import { isGestorLogado, getMatriculaLogada } from '../utils/auth';
import { formatarData, formatarDataHora } from '../utils/formatters';
import { PainelFinanceiro } from '../components/PainelFinanceiro';

export function DetalhesViagem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [historico, setHistorico] = useState<HistoricoViagem[]>([]);
  const [erro, setErro] = useState('');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');

  const isGestor = isGestorLogado();
  const matriculaLogada = getMatriculaLogada();

  const carregarDados = async () => {
    if (!id) return;
    try {
      const [dadosViagem, dadosHistorico] = await Promise.all([
        viagemService.buscarPorId(Number(id)),
        viagemService.listarHistorico(Number(id))
      ]);
      setViagem(dadosViagem);
      setHistorico(dadosHistorico);
    } catch (error) {
      setErro('Viagem não encontrada.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  const handleExcluir = async () => {
    if (!viagem) return;
    setProcessandoAcao(true);
    try {
      await viagemService.excluir(viagem.numero);
      navigate('/');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao excluir a viagem.');
      setConfirmandoExclusao(false);
      setProcessandoAcao(false);
    }
  };

  const handleSubmeter = async () => {
    if (!viagem) return;
    setProcessandoAcao(true);
    try {
      await viagemService.submeterParaAnalise(viagem.numero);
      await carregarDados(); 
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao submeter a solicitação.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleAvaliar = async (acao: 'Aprovada' | 'Rejeitada' | 'Ajustes Solicitados') => {
    if (!viagem) return;
    if (acao !== 'Aprovada' && !comentarioAvaliacao.trim()) {
      setErro(`É obrigatório fornecer um comentário para: ${acao}.`);
      return;
    }

    setProcessandoAcao(true);
    setErro('');
    
    try {
      await viagemService.avaliarViagem(viagem.numero, { acao, comentario: comentarioAvaliacao });
      await carregarDados();
      setComentarioAvaliacao(''); 
    } catch (error: any) {
      setErro(error.response?.data?.message || `Erro ao registrar avaliação (${acao}).`);
    } finally {
      setProcessandoAcao(false);
    }
  };

  if (erro && !viagem) {
    return (
      <div className="card" style={{ maxWidth: '900px' }}>
        <div className="alert error">{erro}</div>
        <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>Voltar</Link>
      </div>
    );
  }
  
  if (!viagem) return <div>Carregando detalhes...</div>;

  const situacaoAtual = viagem.situacao?.descricao || '';
  const isDono = viagem.solicitante?.matricula === matriculaLogada;
  
  // O dono edita as próprias viagens (mesmo que seja o gestor)
  const permiteEdicao = (situacaoAtual === 'Rascunho' || situacaoAtual === 'Ajustes Solicitados') && isDono;
  
  // O gestor avalia as viagens solicitadas (desde que não seja a dele próprio)
  const permiteAvaliacao = situacaoAtual === 'Solicitada' && isGestor && !isDono;

  const viagemAprovada = situacaoAtual === 'Aprovada';

  return (
    <div className="card" style={{ maxWidth: viagemAprovada ? '1200px' : '900px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Detalhes da Viagem #{viagem.numero}</h2>
          <p>Visão geral da solicitação de deslocamento.</p>
        </div>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, padding: '0.4rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
          ← Voltar
        </Link>
      </div>

      {erro && <div className="alert error" style={{ marginBottom: '1.5rem' }}>{erro}</div>}

      <div style={viagemAprovada ? { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)', gap: '2rem', alignItems: 'start' } : undefined}>
      <div className="layout-2-cols" style={viagemAprovada ? { display: 'block' } : undefined}>
        <div>
          <div className="details-section">
            <div className="details-label">Identificação</div>
            <div className="details-value">{viagem.destino}</div>
          </div>
          <div className="details-section">
            <div className="details-label">Período</div>
            <div className="details-value">
              {formatarData(viagem.dataSaida)} até {formatarData(viagem.dataRetorno)}
            </div>
          </div>
          <div className="details-section">
            <div className="details-label">Motivo e Transporte</div>
            <div className="details-value">{viagem.motivo?.descricao}</div>
            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Viajando de {viagem.meioTransporte?.descricao}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-page)', padding: '1.5rem', borderRadius: '8px' }}>
          <div className="details-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div className="details-label">Situação Atual</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${situacaoAtual}`} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
                {situacaoAtual}
              </span>
            </div>
          </div>

          <div className="details-section" style={{ borderBottom: 'none', marginTop: '1.5rem' }}>
            <div className="details-label">Responsável</div>
            <div className="details-value" style={{ fontSize: '1rem' }}>
              <div><strong>{viagem.solicitante?.nome}</strong></div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Matrícula: {viagem.solicitante?.matricula}</div>
            </div>
          </div>

          {permiteEdicao && (
            <div className="action-menu" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              {!confirmandoExclusao ? (
                <>
                  <Link to={`/viagem/${viagem.numero}/editar`} className="btn-secondary" style={{ backgroundColor: '#eab308', color: '#fff', textDecoration: 'none', textAlign: 'center', margin: 0 }}>
                    Alterar
                  </Link>
                  <button onClick={() => setConfirmandoExclusao(true)} className="btn-secondary" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', margin: 0 }}>
                    Excluir
                  </button>
                  <button className="btn-primary" onClick={handleSubmeter} disabled={processandoAcao} style={{ margin: 0 }}>
                    {processandoAcao ? 'Processando...' : 'Submeter para Aprovação'}
                  </button>
                </>
              ) : (
                <div style={{ padding: '1rem', border: '1px solid #fca5a5', borderRadius: '6px', backgroundColor: '#fef2f2' }}>
                  <p style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>Tem certeza? A exclusão não pode ser desfeita.</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleExcluir} disabled={processandoAcao} className="btn-secondary" style={{ backgroundColor: '#ef4444', color: '#fff', flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer', margin: 0 }}>
                      {processandoAcao ? '...' : 'Confirmar'}
                    </button>
                    <button onClick={() => setConfirmandoExclusao(false)} disabled={processandoAcao} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer', margin: 0 }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {permiteAvaliacao && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div className="details-label" style={{ marginBottom: '1rem' }}>Avaliação do Gestor</div>
              
              <div className="form-group">
                <textarea 
                  className="form-control" 
                  placeholder="Justificativa (obrigatória para rejeição ou ajustes)..."
                  rows={3}
                  value={comentarioAvaliacao}
                  onChange={(e) => setComentarioAvaliacao(e.target.value)}
                  disabled={processandoAcao}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn-primary" style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', margin: 0 }} onClick={() => handleAvaliar('Aprovada')} disabled={processandoAcao}>
                  {processandoAcao ? '...' : '✓ Aprovar Viagem'}
                </button>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-secondary" style={{ flex: 1, backgroundColor: '#eab308', color: '#fff', border: 'none', margin: 0 }} onClick={() => handleAvaliar('Ajustes Solicitados')} disabled={processandoAcao}>
                    Pedir Ajustes
                  </button>
                  <button className="btn-secondary" style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', margin: 0 }} onClick={() => handleAvaliar('Rejeitada')} disabled={processandoAcao}>
                    ✗ Rejeitar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {viagemAprovada && (
        <PainelFinanceiro
          numeroViagem={viagem.numero}
          permiteLancamento={isDono}
          situacao={situacaoAtual}
        />
      )}
      </div>

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Histórico da Solicitação</h3>
        {historico.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum histórico encontrado.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historico.map(h => (
              <div key={h.id} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '6px', borderLeft: `4px solid ${h.situacao.descricao === 'Rejeitada' ? '#ef4444' : '#3b82f6'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{h.situacao.descricao}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatarDataHora(h.dataHora)}</span>
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{h.comentario}</p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Por: {h.responsavel?.nome}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}