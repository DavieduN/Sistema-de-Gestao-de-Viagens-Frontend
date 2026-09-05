import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Login() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await api.post('/auth/login', { matricula, senha });
      
      localStorage.setItem('sgv_token', response.data.token);
      navigate('/');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Matrícula ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto' }} className="card">
      <div className="card-header" style={{ textAlign: 'center' }}>
        <h2>SGV - Acesso</h2>
        <p>Sistema de Gestão de Viagens</p>
      </div>

      {erro && <div className="alert error">{erro}</div>}

      <form className="form-grid" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="matricula">Matrícula</label>
          <input 
            type="text" 
            id="matricula"
            className="form-control" 
            placeholder="Ex: 1234-5" 
            value={matricula} 
            onChange={(e) => setMatricula(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input 
            type="password" 
            id="senha"
            className="form-control" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" className="btn-primary" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}