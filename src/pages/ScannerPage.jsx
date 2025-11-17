// src/pages/ScannerPage.jsx
import Sidebar from "../components/Sidebar";

export default function ScannerPage() {
  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">
        <h1>Scanner QR Code</h1>
        <p>Em breve você poderá escanear bobinas diretamente pelo celular.</p>
      </main>
    </div>
  );
}
