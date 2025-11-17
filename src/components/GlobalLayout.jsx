
import Sidebar from "../components/Sidebar.jsx";
import "../styles/Global.css";

export default function GlobalLayout({ children }) {
  return (
    <div className="global-layout">

      <aside className="sidebar-area">
        <Sidebar />
      </aside>

      <main className="main-area">
        {children}
      </main>

    </div>
  );
}
