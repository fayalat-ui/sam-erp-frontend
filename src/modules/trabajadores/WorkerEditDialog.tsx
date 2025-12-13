import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { trabajadoresService } from "@/services/trabajadoresService"; // ajusta import

type Worker = {
  Id?: number | string;
  Nombres?: string;
  Apellidos?: string;
  Email_PERSONAL?: string;
  Celular?: string;
  Direccion?: string;
  Ciudad?: string;
  // ... agrega los campos reales
};

export function WorkerEditDialog({
  open,
  onOpenChange,
  worker,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: Worker;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Worker>(worker);

  useEffect(() => {
    setForm(worker);
  }, [worker]);

  const updateField = (key: keyof Worker, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // OJO: ajusta el id según tu modelo (ID, Id, _OldID, etc.)
      const id = worker.Id;
      if (!id) throw new Error("Trabajador sin ID");

      // Construye payload SOLO con campos editables
      const payload = {
        Nombres: form.Nombres?.trim() ?? "",
        Apellidos: form.Apellidos?.trim() ?? "",
        Email_PERSONAL: form.Email_PERSONAL?.trim() ?? "",
        Celular: form.Celular ?? "",
        Direccion: form.Direccion ?? "",
        Ciudad: form.Ciudad ?? "",
      };

      await trabajadoresService.update(String(id), payload);

      toast.success("Trabajador actualizado");
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "No se pudo actualizar el trabajador");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar trabajador</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Nombres</label>
            <Input value={form.Nombres ?? ""} onChange={(e) => updateField("Nombres", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Apellidos</label>
            <Input value={form.Apellidos ?? ""} onChange={(e) => updateField("Apellidos", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Email personal</label>
            <Input value={form.Email_PERSONAL ?? ""} onChange={(e) => updateField("Email_PERSONAL", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Celular</label>
            <Input value={form.Celular ?? ""} onChange={(e) => updateField("Celular", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm">Dirección</label>
            <Input value={form.Direccion ?? ""} onChange={(e) => updateField("Direccion", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm">Ciudad</label>
            <Input value={form.Ciudad ?? ""} onChange={(e) => updateField("Ciudad", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
