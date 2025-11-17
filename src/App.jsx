import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas
import HomePage from "./pages/HomePage.jsx";
import CadastroPage from "./pages/CadastroPage.jsx";
import EstoquePage from "./pages/Estoque.jsx";
import LaboratorioPage from "./pages/LaboratorioPage.jsx";
import QualidadePage from "./pages/QualidadePage.jsx";
import CoordenacaoPage from "./pages/CoordenacaoPage.jsx";
import ScannerPage from "./pages/ScannerPage.jsx";
import BobinaDetalhesPage from "./pages/BobinaDetalhes.jsx";

// 🔵 NOVA PÁGINA
import ProducaoPage from "./pages/ProducaoPage.jsx";

// CSS Global
import "./styles/Global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
        <Route path="/laboratorio" element={<LaboratorioPage />} />
        <Route path="/qualidade" element={<QualidadePage />} />
        <Route path="/coordenacao" element={<CoordenacaoPage />} />
        <Route path="/scanner" element={<ScannerPage />} />

        {/* 🟦 Detalhes da Bobina */}
        <Route path="/bobina/:rastro" element={<BobinaDetalhesPage />} />

        {/* 🆕 Produção (Registrar peças feitas) */}
        <Route path="/producao" element={<ProducaoPage />} />
      </Routes>
    </BrowserRouter>
  );
}
