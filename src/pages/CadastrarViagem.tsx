import React, { useState, useEffect } from 'react';
import { viagemService } from '../services/viagemService';
import { Link, useNavigate } from 'react-router-dom';
import type { ViagemForm, Motivo, MeioTransporte } from '../types/viagem';

export function CadastrarViagem() {
  const navigate = useNavigate();

  // O estado agora reflete a nova interface ViagemForm do Swagger, 
  // usando IDs numéricos para motivo e meio de transporte, e sem a matrícula.
  const [formData, setFormData] = useState<ViagemForm>({
    destino: '',
    dataSaida: '',
    dataRetorno: '',
    motivoId: '', 
    meioTransporteId: ''
  });

  // Estados para armazenar as opções dos dropdowns que virão da API
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [meiosTransporte, setMeiosTransporte] = useState<MeioTransporte[]>([]);

  const [status, setStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'carregando' | null; mensagem: string }>({
    tipo: null,
    mensagem: ''
  });

  // Carrega os dados auxiliares (Motivos e Meios de Transporte) ao montar o componente
  useEffect(() => {
    const carregarDominiosAuxiliares = async () => {
      try {
        const [listaMotivos, listaTransportes] = await Promise.all([
          viagemService.listarMotivos(),
          viagemService.listarMeiosTransporte()
        ]);
        setMotivos(listaMotivos);
        setMeiosTransporte(listaTransportes);
      } catch (error) {
        console.error("Erro ao buscar dados auxiliares", error);
        setStatus({ tipo: 'erro', mensagem: 'Falha ao carregar opções do formulário. Recarregue a página.' });
      }
    };

    carregarDominiosAuxiliares();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Se o campo for um dos IDs (que vem do <select>), converte a string para número.
    // Isso garante que o JSON enviado para a API obedeça ao contrato do Swagger (integer).
    const parsedValue = (name === 'motivoId' || name === 'meioTransporteId') && value !== '' 
      ? Number(value) 
      : value;

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ tipo: 'carregando', mensagem: 'Salvando solicitação...' });

    try {
      await viagemService.cadastrar(formData);
      setStatus({ tipo: 'sucesso', mensagem: 'Viagem cadastrada com sucesso! (Situação: Rascunho)' });
      
      // Limpa o formulário após o sucesso
      setFormData({ destino: '', dataSaida: '', dataRetorno: '', motivoId: '', meioTransporteId: '' });
      
      // Opcional: Redireciona o usuário de volta para a listagem após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro ao comunicar com o servidor.';
      setStatus({ tipo: 'erro', mensagem: `Falha ao cadastrar: ${mensagemErro}` });
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Nova Viagem</h2>
          <p>Preencha os dados do seu deslocamento para aprovação.</p>
        </div>
        <Link to="/" style={{ 
          color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, 
          padding: '0.4rem 0.8rem', border: '1px solid var(--border)', 
          borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' 
        }}>
          ← Cancelar
        </Link>
      </div>

      {status.tipo && status.tipo !== 'carregando' && (
        <div className={`alert ${status.tipo}`}>
          {status.mensagem}
        </div>
      )}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destino">Destino</label>
          <input 
            type="text" 
            id="destino" 
            name="destino" 
            className="form-control" 
            placeholder="Ex: São Paulo - SP" 
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

        {/* Dropdown dinâmico para Motivo usando o ID */}
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

        {/* Dropdown dinâmico para Meio de Transporte usando o ID */}
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
          {status.tipo === 'carregando' ? 'Enviando...' : 'Cadastrar Viagem'}
        </button>
      </form>
    </div>
  );
}