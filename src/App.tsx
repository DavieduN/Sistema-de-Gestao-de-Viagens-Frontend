import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ListarViagem } from './pages/ListarViagem';
import { CadastrarViagem } from './pages/CadastrarViagem';
import { CadastrarColaborador } from './pages/CadastrarColaborador';
import { DetalhesViagem } from './pages/DetalhesViagem';
import { AlterarViagem } from './pages/AlterarViagem';
import { Login } from './pages/Login';
import { tokenValido, logout } from './utils/auth';

function RotaPrivada({ children }: { children: JSX.Element }) {
  if (!tokenValido()) {
    logout();
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<RotaPrivada><ListarViagem /></RotaPrivada>} />
        <Route path="/cadastrar" element={<RotaPrivada><CadastrarViagem /></RotaPrivada>} />
        <Route path="/colaboradores/cadastrar" element={<RotaPrivada><CadastrarColaborador /></RotaPrivada>} />
        <Route path="/viagem/:id" element={<RotaPrivada><DetalhesViagem /></RotaPrivada>} />
        <Route path="/viagem/:id/editar" element={<RotaPrivada><AlterarViagem /></RotaPrivada>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;