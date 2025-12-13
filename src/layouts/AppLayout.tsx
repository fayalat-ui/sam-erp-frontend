import { Outlet, Link } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <h1 className="text-xl font-semibold mb-6">SAM ERP</h1>
        <nav className="space-y-2">
          <Link
            to="/trabajadores"
            className="block px-3 py-2 rounded hover:bg-slate-700"
          >
            Trabajadores
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-3">
          <span className="text-sm text-slate-600">
            Usuario conectado
          </span>
        </header>

        <section className="flex-1 overflow-auto p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
