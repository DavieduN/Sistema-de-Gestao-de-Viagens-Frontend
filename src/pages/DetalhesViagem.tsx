import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { viagemService } from '../services/viagemService';
import type { Viagem } from '../types/viagem';

export function DetalhesViagem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [erro, setErro] = useState('');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  useEffect(() => {
    if (id) {
      viagemService.buscarPorId(Number(id))
        .then(dados => setViagem(dados))
        .catch(() => setErro('Viagem não encontrada.'));
    }
  }, [id]);

  const handleExcluir = async () => {
    if (!viagem) return;
    
    try {
      await viagemService.excluir(viagem.numero);
      navigate('/');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao excluir a viagem.');
      setConfirmandoExclusao(false);
    }
  };

  if (erro) return <div className="card" style={{ maxWidth: '900px' }}><div className="alert error">{erro}</div><Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>Voltar</Link></div>;
  if (!viagem) return <div>Carregando detalhes...</div>;

  const bloqueiaEdicao = viagem.situacao === 'Aprovada' || viagem.situacao === 'Rejeitada';

  return (
    <div className="card" style={{ maxWidth: '900px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Detalhes da Viagem #{viagem.numero}</h2>
          <p>Revise as informações antes da aprovação.</p>
        </div>
        <Link to="/" style={{ 
          color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, 
          padding: '0.4rem 0.8rem', border: '1px solid var(--border)', 
          borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' 
        }}>
          ← Voltar
        </Link>
      </div>

      <div className="layout-2-cols">
        <div>
          <div className="details-section">
            <div className="details-label">Identificação</div>
            <div className="details-value">{viagem.destino}</div>
          </div>

          <div className="details-section">
            <div className="details-label">Período</div>
            <div className="details-value">
              {viagem.dataSaida} até {viagem.dataRetorno}
            </div>
          </div>

          <div className="details-section">
            <div className="details-label">Motivo e Transporte</div>
            <div className="details-value">{viagem.motivo}</div>
            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Viajando de {viagem.meioTransporte}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-page)', padding: '1.5rem', borderRadius: '8px' }}>
          <div className="details-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div className="details-label">Situação Atual</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${viagem.situacao}`} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
                {viagem.situacao}
              </span>
            </div>
          </div>

          <div className="details-section" style={{ borderBottom: 'none', marginTop: '1.5rem' }}>
            <div className="details-label">Responsável</div>
            <div className="details-value" style={{ fontSize: '1rem' }}>
              Matrícula: {viagem.empregado.matricula}
            </div>
          </div>

          <div className="action-menu">
            {!bloqueiaEdicao && !confirmandoExclusao && (
              <>
                <Link to={`/viagem/${viagem.numero}/editar`} className="btn-secondary" style={{ backgroundColor: '#eab308', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                  Alterar
                </Link>
                <button onClick={() => setConfirmandoExclusao(true)} className="btn-secondary" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Excluir
                </button>
                <button className="btn-primary">
                  Submeter para Análise (UC03)
                </button>
              </>
            )}

            {confirmandoExclusao && (
              <div style={{ padding: '1rem', border: '1px solid #fca5a5', borderRadius: '6px', backgroundColor: '#fef2f2' }}>
                <p style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>Tem certeza? A exclusão não pode ser desfeita.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleExcluir} className="btn-secondary" style={{ backgroundColor: '#ef4444', color: '#fff', flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer' }}>
                    Confirmar
                  </button>
                  <button onClick={() => setConfirmandoExclusao(false)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}