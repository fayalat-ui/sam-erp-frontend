import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

import { updateTrabajador } from "@/services/sharepoint/trabajadores";

type WorkerLike = Record<string, any>;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: WorkerLike;
  trabajadorId: string;
  onSaved: () => void | Promise<void>;
};

export function WorkerEditDialog({ open, onOpenChange, worker, trabajadorId, onSaved }: Props) {
  const [saving, setSaving] = useState(false);

  const initial = useMemo(() => {
    return {
      Nombres: worker?.Nombres ?? "",
      Apellidos: worker?.Apellidos ?? "",
      N_documento: worker?.N_documento ?? "",
      Email_Empresa: worker?.Email_Empresa ?? "",
      Email_PERSONAL: worker?.Email_PERSONAL ?? "",
      Estado: worker?.Estado ?? "",
      NACIMIENTO: (worker?.NACIMIENTO ?? "").slice?.(0, 10) ?? "",
      Celular: worker?.Celular ?? "",
      DIRECCION_ANTIGUA: worker?.DIRECCION_ANTIGUA ?? "",
      Ciudad: worker?.Ciudad ?? "",
    };
  }, [worker]);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    const id = trabajadorId || String(worker?.id ?? "");
    if (!id) {
      toast.error("No pude detectar el ID del trabajador.");
      return;
    }

    try {
      setSaving(true);

      const payload: Record<string, any> = {
        Nombres: String(form.Nombres ?? "").trim(),
        Apellidos: String(form.Apellidos ?? "").trim(),
        N_documento: String(form.N_documento ?? "").trim(),
        Email_Empresa: String(form.Email_Empresa ?? "").trim(),
        Email_PERSONAL: String(form.Email_PERSONAL ?? "").trim(),
        Estado: String(form.Estado ?? "").trim(),
        Celular: String(form.Celular ?? "").trim(),
        DIRECCION_ANTIGUA: String(form.DIRECCION_ANTIGUA ?? "").trim(),
        Ciudad: String(form.Ciudad ?? "").trim(),
      };

      if (form.NACIMIENTO?.trim()) {
        payload.NACIMIENTO = `${form.NACIMIENTO}T00:00:00Z`;
      }

      await updateTrabajador(id, payload);

      toast.success("Trabajador actualizado");
      onOpenChange(false);
      await onSaved();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar trabajador</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Nombres</label>
            <Input value={form.Nombres} onChange={(e) => setField("Nombres", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Apellidos</label>
            <Input value={form.Apellidos} onChange={(e) => setField("Apellidos", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">RUT</label>
            <Input value={form.N_documento} onChange={(e) => setField("N_documento", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Estado</label>
            <Input value={form.Estado} onChange={(e) => setField("Estado", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Email empresa</label>
            <Input value={form.Email_Empresa} onChange={(e) => setField("Email_Empresa", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Email personal</label>
            <Input value={form.Email_PERSONAL} onChange={(e) => setField("Email_PERSONAL", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Celular</label>
            <Input value={form.Celular} onChange={(e) => setField("Celular", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Ciudad</label>
            <Input value={form.Ciudad} onChange={(e) => setField("Ciudad", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm">Dirección</label>
            <Input value={form.DIRECCION_ANTIGUA} onChange={(e) => setField("DIRECCION_ANTIGUA", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Nacimiento (YYYY-MM-DD)</label>
            <Input
              value={form.NACIMIENTO}
              onChange={(e) => setField("NACIMIENTO", e.target.value)}
              placeholder="1990-12-31"
            />
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
