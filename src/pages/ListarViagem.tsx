import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { viagemService } from '../services/viagemService';
import type { Viagem } from '../types/viagem';

export function ListarViagem() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    viagemService.listarTodas()
      .then(dados => setViagens(dados))
      .catch(err => console.error("Erro ao buscar viagens:", err))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="card" style={{ maxWidth: '900px' }}>
      
      <div className="card-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        gap: '1.5rem', 
        flexWrap: 'wrap' 
      }}>
        <div style={{ flex: '1 1 min-content' }}>
          <h2>Minhas Viagens</h2>
          <p style={{ marginTop: '0.25rem', lineHeight: '1.4' }}>
            Consulte e acompanhe o status das suas solicitações cadastradas.
          </p>
        </div>
        <Link to="/cadastrar" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 0 }}>
          + Nova Viagem
        </Link>
      </div>

      {carregando ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Carregando viagens...</p>
        </div>
      ) : viagens.length === 0 ? (
        
        /* Estado vazio melhorado visualmente */
        <div style={{ 
          padding: '3rem 1rem', 
          textAlign: 'center', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px',
          border: '1px dashed var(--border)'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Nenhuma viagem registrada</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Você ainda não possui solicitações de viagem no sistema.
          </p>
          <Link to="/cadastrar" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Criar meu primeiro rascunho
          </Link>
        </div>
        
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Destino</th>
                <th>Período</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {viagens.map(viagem => (
                <tr key={viagem.numero}>
                  <td><strong>{viagem.destino}</strong></td>
                  <td>{viagem.dataSaida} a {viagem.dataRetorno}</td>
                  <td><span className={`badge ${viagem.situacao}`}>{viagem.situacao}</span></td>
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