import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { empregadoService } from '../services/empregadoService';
import type { EmpregadoForm, Cargo, Area } from '../types/viagem';

export function CadastrarColaborador() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EmpregadoForm>({
    matricula: '',
    senha: '',
    nome: '',
    cargoId: '',
    areaId: ''
  });

  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const [status, setStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'carregando' | null; mensagem: string }>({
    tipo: null,
    mensagem: ''
  });

  useEffect(() => {
    const carregarDominios = async () => {
      try {
        const [listaCargos, listaAreas] = await Promise.all([
          empregadoService.listarCargos(),
          empregadoService.listarAreas()
        ]);
        setCargos(listaCargos);
        setAreas(listaAreas);
      } catch (error) {
        console.error('Erro ao buscar cargos/áreas', error);
        setStatus({ tipo: 'erro', mensagem: 'Falha ao carregar opções do formulário. Recarregue a página.' });
      }
    };

    carregarDominios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'cargoId' || name === 'areaId') && value !== ''
      ? Number(value)
      : value;

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ tipo: 'carregando', mensagem: 'Salvando colaborador...' });

    try {
      await empregadoService.cadastrar(formData);
      setStatus({ tipo: 'sucesso', mensagem: 'Colaborador cadastrado com sucesso!' });

      setFormData({ matricula: '', senha: '', nome: '', cargoId: '', areaId: '' });

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
          <h2>Novo Colaborador</h2>
          <p>Cadastre um colaborador para que ele possa acessar o sistema.</p>
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
          <label htmlFor="nome">Nome</label>
          <input
            type="text"
            id="nome"
            name="nome"
            className="form-control"
            placeholder="Ex: Maria da Silva"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="matricula">Matrícula</label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              className="form-control"
              placeholder="Ex: 1234-5"
              pattern="[0-9]{4}-[0-9]"
              title="Formato XXXX-X (Ex: 1234-5)"
              value={formData.matricula}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              className="form-control"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cargoId">Cargo</label>
            <select
              id="cargoId"
              name="cargoId"
              className="form-control"
              value={formData.cargoId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecione o cargo</option>
              {cargos.map(cargo => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="areaId">Área</label>
            <select
              id="areaId"
              name="areaId"
              className="form-control"
              value={formData.areaId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecione a área</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {areas.length === 0 && (
          <div className="alert error">
            Não há áreas cadastradas. É preciso cadastrar uma área antes de criar um colaborador.
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={status.tipo === 'carregando' || areas.length === 0}>
          {status.tipo === 'carregando' ? 'Enviando...' : 'Cadastrar Colaborador'}
        </button>
      </form>
    </div>
  );
}
