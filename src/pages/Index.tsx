import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Punto de entrada único: mandamos al login
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SAM ERP</h1>
          <p className="text-xl text-blue-200 mb-6">
            Sistema de Administración y Monitoreo
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    </div>
  );
}
