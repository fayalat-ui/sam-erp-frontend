import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTrabajadorById } from "@/services/sharepoint/trabajadores";

export default function WorkerDetail() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    if (id) getTrabajadorById(id).then(setWorker);
  }, [id]);

  if (!worker) return <p>Cargando…</p>;

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        {worker.NOMNRE_COMPLETO}
      </h2>

      <div className="bg-white p-4 rounded border space-y-2">
        <p><b>RUT:</b> {worker.N_documento}</p>
        <p><b>Email:</b> {worker.Email_Empresa}</p>
        <p><b>Estado:</b> {worker.Estado}</p>
        <p><b>Fecha nacimiento:</b> {worker.NACIMIENTO?.slice(0, 10)}</p>
      </div>
    </>
  );
}
