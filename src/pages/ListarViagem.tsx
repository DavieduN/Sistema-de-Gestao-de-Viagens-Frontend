import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { viagemService } from '../services/viagemService';
import type { Viagem } from '../types/viagem';
import { isGestorLogado, logout } from '../utils/auth';
import { formatarData } from '../utils/formatters';

export function ListarViagem() {
  const navigate = useNavigate();
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const isGestor = isGestorLogado();

  const handleSair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const dados = isGestor 
          ? await viagemService.listarTodas() 
          : await viagemService.listarMinhasViagens();
        setViagens(dados);
      } catch (err) {
        setErro('Falha ao carregar as viagens.');
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [isGestor]);

  return (
    <div className="card" style={{ maxWidth: '900px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 min-content' }}>
          <h2>{isGestor ? 'Todas as Viagens (Gestor)' : 'Minhas Viagens'}</h2>
          <p style={{ marginTop: '0.25rem', lineHeight: '1.4' }}>
            {isGestor 
              ? 'Acompanhe todas as solicitações de viagem cadastradas pela equipe.'
              : 'Consulte e acompanhe o status das suas solicitações cadastradas.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/cadastrar" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 0 }}>
            + Nova Viagem
          </Link>
          {isGestor && (
            <Link to="/colaboradores/cadastrar" className="btn-secondary" style={{ textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 0 }}>
              + Novo Colaborador
            </Link>
          )}
          <button type="button" onClick={handleSair} className="btn-secondary" style={{ whiteSpace: 'nowrap', marginTop: 0 }}>
            Sair
          </button>
        </div>
      </div>

      {erro && <div className="alert error" style={{ margin: '1rem' }}>{erro}</div>}

      {carregando ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Carregando viagens...</p>
        </div>
      ) : viagens.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed var(--border)', margin: '0 1rem 1rem 1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Nenhuma viagem encontrada</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {isGestor 
              ? 'Não há solicitações de viagem registradas no sistema.'
              : 'Você ainda não possui solicitações de viagem no sistema.'}
          </p>
          {!isGestor && (
            <Link to="/cadastrar" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Criar meu primeiro rascunho
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Destino</th>
                {isGestor && <th>Solicitante</th>}
                <th>Período</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {viagens.map(viagem => (
                <tr key={viagem.numero}>
                  <td><strong>{viagem.destino}</strong></td>
                  {isGestor && <td>{viagem.solicitante?.nome}</td>}
                  {/* Utilizando o utilitário aqui */}
                  <td>{formatarData(viagem.dataSaida)} a {formatarData(viagem.dataRetorno)}</td>
                  <td><span className={`badge ${viagem.situacao?.descricao}`}>{viagem.situacao?.descricao}</span></td>
                  <td>
                    <Link to={`/viagem/${viagem.numero}`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}