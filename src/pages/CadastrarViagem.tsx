import React, { useState } from 'react';
import { viagemService } from '../services/viagemService';
import type { ViagemForm } from '../types/viagem';

export function CadastrarViagem() {
  const [formData, setFormData] = useState<ViagemForm>({
    destino: '',
    dataSaida: '',
    dataRetorno: '',
    motivo: '',
    meioTransporte: '',
    empregadoMatricula: ''
  });

  const [status, setStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'carregando' | null; mensagem: string }>({
    tipo: null,
    mensagem: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ tipo: 'carregando', mensagem: 'Salvando solicitação...' });

    try {
      await viagemService.cadastrar(formData);
      setStatus({ tipo: 'sucesso', mensagem: 'Viagem cadastrada com sucesso! (Situação: Rascunho)' });
      setFormData({ destino: '', dataSaida: '', dataRetorno: '', motivo: '', meioTransporte: '', empregadoMatricula: '' });
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro ao comunicar com o servidor.';
      setStatus({ tipo: 'erro', mensagem: `Falha ao cadastrar: ${mensagemErro}` });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Nova Viagem</h2>
        <p>Preencha os dados do seu deslocamento para aprovação.</p>
      </div>

      {status.tipo && status.tipo !== 'carregando' && (
        <div className={`alert ${status.tipo}`}>
          {status.mensagem}
        </div>
      )}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destino">Destino</label>
          <input type="text" id="destino" name="destino" className="form-control" placeholder="Ex: São Paulo - SP" value={formData.destino} onChange={handleChange} required />
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
          <label htmlFor="empregadoMatricula">Matrícula (Temporário)</label>
          <input type="text" id="empregadoMatricula" name="empregadoMatricula" className="form-control" placeholder="Matrícula do responsável" value={formData.empregadoMatricula} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn-primary" disabled={status.tipo === 'carregando'}>
          {status.tipo === 'carregando' ? 'Enviando...' : 'Cadastrar Viagem'}
        </button>
      </form>
    </div>
  );
}