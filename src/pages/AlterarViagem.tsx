import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { viagemService } from '../services/viagemService';
import type { ViagemForm } from '../types/viagem';

export function AlterarViagem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ViagemForm>({
    destino: '', dataSaida: '', dataRetorno: '', motivo: '', meioTransporte: '', empregadoMatricula: ''
  });

  const [status, setStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'carregando' | null; mensagem: string }>({
    tipo: 'carregando', mensagem: 'Carregando dados da viagem...'
  });

  useEffect(() => {
    if (id) {
      viagemService.buscarPorId(Number(id))
        .then(dados => {
          if (dados.situacao === 'Aprovada' || dados.situacao === 'Rejeitada') {
            setStatus({ tipo: 'erro', mensagem: 'Viagens aprovadas ou rejeitadas não podem ser alteradas.' });
            return;
          }
          setFormData({
            destino: dados.destino,
            dataSaida: dados.dataSaida,
            dataRetorno: dados.dataRetorno,
            motivo: dados.motivo,
            meioTransporte: dados.meioTransporte,
            empregadoMatricula: dados.empregado.matricula // Correção do mapeamento
          });
          setStatus({ tipo: null, mensagem: '' });
        })
        .catch(() => setStatus({ tipo: 'erro', mensagem: 'Viagem não encontrada.' }));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ tipo: 'carregando', mensagem: 'Atualizando solicitação...' });

    try {
      await viagemService.atualizar(Number(id), formData);
      setStatus({ tipo: 'sucesso', mensagem: 'Viagem atualizada com sucesso!' });
      setTimeout(() => navigate(`/viagem/${id}`), 1500);
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro ao comunicar com o servidor.';
      setStatus({ tipo: 'erro', mensagem: `Falha ao atualizar: ${mensagemErro}` });
    }
  };

  if (status.tipo === 'erro' && status.mensagem.includes('não podem ser alteradas')) {
    return (
      <div className="card">
        <div className="alert error">{status.mensagem}</div>
        <Link to={`/viagem/${id}`} className="btn-secondary" style={{ textDecoration: 'none' }}>Voltar aos detalhes</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Alterar Viagem #{id}</h2>
          <p>Atualize as informações do seu deslocamento.</p>
        </div>
        <Link to={`/viagem/${id}`} style={{ 
          color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, 
          padding: '0.4rem 0.8rem', border: '1px solid var(--border)', 
          borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' 
        }}>
          ← Cancelar
        </Link>
      </div>

      {status.tipo && status.tipo !== 'carregando' && (
        <div className={`alert ${status.tipo}`}>{status.mensagem}</div>
      )}

      {status.tipo === 'carregando' && status.mensagem.includes('Carregando') ? (
        <p>{status.mensagem}</p>
      ) : (
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="destino">Destino</label>
            <input type="text" id="destino" name="destino" className="form-control" value={formData.destino} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dataSaida">Data de Saída</label>
              <input type="date" id="dataSaida" name="dataSaida" className="form-control" value={formData.dataSaida} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="dataRetorno">Data de Retorno</label>
              <input type="date" id="dataRetorno" name="dataRetorno" className="form-control" value={formData.dataRetorno} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="motivo">Motivo</label>
            <select id="motivo" name="motivo" className="form-control" value={formData.motivo} onChange={handleChange} required>
              <option value="" disabled>Selecione o objetivo da viagem</option>
              <option value="Reunião com cliente">Reunião com cliente</option>
              <option value="Treinamento">Treinamento</option>
              <option value="Evento ou congresso">Evento ou congresso</option>
              <option value="Visita técnica">Visita técnica</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="meioTransporte">Meio de Transporte</label>
            <select id="meioTransporte" name="meioTransporte" className="form-control" value={formData.meioTransporte} onChange={handleChange} required>
              <option value="" disabled>Selecione o meio principal</option>
              <option value="Avião">Avião</option>
              <option value="Ônibus">Ônibus</option>
              <option value="Carro próprio">Carro próprio</option>
              <option value="Carro da empresa">Carro da empresa</option>
              <option value="Trem">Trem</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="empregadoMatricula">Matrícula (Responsável)</label>
            <input type="text" id="empregadoMatricula" name="empregadoMatricula" className="form-control" value={formData.empregadoMatricula} readOnly style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} />
          </div>

          <button type="submit" className="btn-primary" disabled={status.tipo === 'carregando'}>
            {status.tipo === 'carregando' ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      )}
    </div>
  );
}