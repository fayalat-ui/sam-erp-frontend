import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTrabajadorById } from "@/services/sharepoint/trabajadores";
import { WorkerEditDialog } from "@/modules/trabajadores/WorkerEditDialog";

export default function WorkerDetail() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);

  const refetch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getTrabajadorById(id);
      setWorker(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !worker) return <p>Cargando…</p>;
  if (!worker) return <p>No se encontró el trabajador.</p>;

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {worker.NOMNRE_COMPLETO || "Trabajador"}
          </h2>
          <p className="text-sm text-muted-foreground">
            ID: {worker.Id ?? worker.ID ?? worker.id ?? id}
          </p>
        </div>

        <Button onClick={() => setOpenEdit(true)}>
          Editar
        </Button>
      </div>

      <div className="bg-white p-4 rounded border space-y-2">
        <p><b>RUT:</b> {worker.N_documento || "—"}</p>
        <p><b>Email empresa:</b> {worker.Email_Empresa || "—"}</p>
        <p><b>Email personal:</b> {worker.Email_PERSONAL || "—"}</p>
        <p><b>Estado:</b> {worker.Estado || "—"}</p>
        <p><b>Fecha nacimiento:</b> {worker.NACIMIENTO?.slice?.(0, 10) || "—"}</p>
        <p><b>Celular:</b> {worker.Celular || "—"}</p>
        <p><b>Dirección:</b> {worker.DIRECCION_ANTIGUA || "—"}</p>
        <p><b>Ciudad:</b> {worker.Ciudad || "—"}</p>
      </div>

      <WorkerEditDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        worker={worker}
        trabajadorId={id || ""}
        onSaved={refetch}
      />
    </>
  );
}
