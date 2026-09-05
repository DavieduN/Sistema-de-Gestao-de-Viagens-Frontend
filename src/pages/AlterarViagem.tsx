import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { viagemService } from '../services/viagemService';
import type { ViagemForm, Motivo, MeioTransporte } from '../types/viagem';

export function AlterarViagem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ViagemForm>({
    destino: '', 
    dataSaida: '', 
    dataRetorno: '', 
    motivoId: '', 
    meioTransporteId: ''
  });

  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [meiosTransporte, setMeiosTransporte] = useState<MeioTransporte[]>([]);

  const [status, setStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'carregando' | null; mensagem: string }>({
    tipo: 'carregando', mensagem: 'Carregando dados da viagem...'
  });

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      if (!id) return;
      try {
        // Busca os domínios auxiliares e os dados da viagem em paralelo
        const [listaMotivos, listaTransportes, dadosViagem] = await Promise.all([
          viagemService.listarMotivos(),
          viagemService.listarMeiosTransporte(),
          viagemService.buscarPorId(Number(id))
        ]);

        setMotivos(listaMotivos);
        setMeiosTransporte(listaTransportes);

        const situacaoAtual = dadosViagem.situacao?.descricao || '';
        if (situacaoAtual === 'Aprovada' || situacaoAtual === 'Rejeitada') {
          setStatus({ tipo: 'erro', mensagem: 'Viagens aprovadas ou rejeitadas não podem ser alteradas.' });
          return;
        }

        // Popula o formulário com os IDs corretos vindos do relacionamento
        setFormData({
          destino: dadosViagem.destino,
          dataSaida: dadosViagem.dataSaida,
          dataRetorno: dadosViagem.dataRetorno,
          motivoId: dadosViagem.motivo?.id || '',
          meioTransporteId: dadosViagem.meioTransporte?.id || ''
        });

        setStatus({ tipo: null, mensagem: '' });
      } catch (error) {
        setStatus({ tipo: 'erro', mensagem: 'Erro ao carregar os dados da viagem.' });
      }
    };

    carregarDadosIniciais();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Converte para número se for um dos campos de ID
    const parsedValue = (name === 'motivoId' || name === 'meioTransporteId') && value !== '' 
      ? Number(value) 
      : value;

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
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
      <div className="card" style={{ maxWidth: '900px' }}>
        <div className="alert error">{status.mensagem}</div>
        <Link to={`/viagem/${id}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
          Voltar aos detalhes
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '900px' }}>
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
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{status.mensagem}</p>
      ) : (
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="destino">Destino</label>
            <input 
              type="text" 
              id="destino" 
              name="destino" 
              className="form-control" 
              value={formData.destino} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dataSaida">Data de Saída</label>
              <input 
                type="date" 
                id="dataSaida" 
                name="dataSaida" 
                className="form-control" 
                value={formData.dataSaida} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="dataRetorno">Data de Retorno</label>
              <input 
                type="date" 
                id="dataRetorno" 
                name="dataRetorno" 
                className="form-control" 
                value={formData.dataRetorno} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Select Dinâmico para Motivo */}
          <div className="form-group">
            <label htmlFor="motivoId">Motivo</label>
            <select 
              id="motivoId" 
              name="motivoId" 
              className="form-control" 
              value={formData.motivoId} 
              onChange={handleChange} 
              required
            >
              <option value="" disabled>Selecione o objetivo da viagem</option>
              {motivos.map(motivo => (
                <option key={motivo.id} value={motivo.id}>
                  {motivo.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Select Dinâmico para Meio de Transporte */}
          <div className="form-group">
            <label htmlFor="meioTransporteId">Meio de Transporte</label>
            <select 
              id="meioTransporteId" 
              name="meioTransporteId" 
              className="form-control" 
              value={formData.meioTransporteId} 
              onChange={handleChange} 
              required
            >
              <option value="" disabled>Selecione o meio principal</option>
              {meiosTransporte.map(transporte => (
                <option key={transporte.id} value={transporte.id}>
                  {transporte.descricao}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={status.tipo === 'carregando'}>
            {status.tipo === 'carregando' ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      )}
    </div>
  );
}