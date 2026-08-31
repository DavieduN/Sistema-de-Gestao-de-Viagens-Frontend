import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ListarViagem } from './pages/ListarViagem';
import { CadastrarViagem } from './pages/CadastrarViagem';
import { DetalhesViagem } from './pages/DetalhesViagem';
import { AlterarViagem } from './pages/AlterarViagem';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListarViagem />} />
        <Route path="/cadastrar" element={<CadastrarViagem />} />
        <Route path="/viagem/:id" element={<DetalhesViagem />} />
        <Route path="/viagem/:id/editar" element={<AlterarViagem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;