import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkersTable from "./WorkersTable";
import { getTrabajadores } from "@/services/sharepoint/trabajadores";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getTrabajadores().then(setWorkers);
  }, []);

  const filtered = workers.filter(w =>
    `${w.NOMNRE_COMPLETO} ${w.N_documento} ${w.Email_Empresa}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Trabajadores</h2>

      <input
        type="text"
        placeholder="Buscar por nombre, RUT o email"
        className="mb-4 w-full max-w-md px-3 py-2 border rounded"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <WorkersTable
        workers={filtered}
        onSelect={id => navigate(`/trabajadores/${id}`)}
      />
    </>
  );
}
