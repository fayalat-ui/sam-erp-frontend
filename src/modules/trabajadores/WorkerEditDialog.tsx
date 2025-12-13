import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

// Ajusta este import cuando vea tu proyecto
import { trabajadoresService } from "@/services/trabajadoresService";

type WorkerLike = Record<string, any>;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: WorkerLike;
  onSaved: () => void | Promise<void>;
};

function pickId(worker: WorkerLike): string | null {
  // Ajustaremos esto con tu modelo real
  const id =
    worker?.Id ??
    worker?.ID ??
    worker?.id ??
    worker?._OldID ??
    null;

  if (id === null || id === undefined) return null;
  return String(id);
}

export function WorkerEditDialog({ open, onOpenChange, worker, onSaved }: Props) {
  const [saving, setSaving] = useState(false);

  const initial = useMemo(() => {
    // Campos típicos en tu lista (los vi en tu SharePoint)
    return {
      Nombres: worker?.Nombres ?? "",
      Apellidos: worker?.Apellidos ?? "",
      Email_PERSONAL: worker?.Email_PERSONAL ?? "",
      Email_Empresa: worker?.Email_Empresa ?? "",
      Celular: worker?.Celular ?? "",
      Ciudad: worker?.Ciudad ?? "",
      DIRECCION_ANTIGUA: worker?.DIRECCION_ANTIGUA ?? "",
      Profesion: worker?.Profesion ?? "",
      Estado: worker?.Estado ?? "",
      ROL: worker?.ROL ?? "",
    };
  }, [worker]);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    const id = pickId(worker);
    if (!id) {
      toast.error("No pude detectar el ID del trabajador para actualizar.");
      return;
    }

    try {
      setSaving(true);

      // Payload solo con campos editables (sin columnas sistema)
      const payload = {
        Nombres: String(form.Nombres ?? "").trim(),
        Apellidos: String(form.Apellidos ?? "").trim(),
        Email_PERSONAL: String(form.Email_PERSONAL ?? "").trim(),
        Email_Empresa: String(form.Email_Empresa ?? "").trim(),
        Celular: String(form.Celular ?? "").trim(),
        Ciudad: String(form.Ciudad ?? "").trim(),
        DIRECCION_ANTIGUA: String(form.DIRECCION_ANTIGUA ?? "").trim(),
        Profesion: String(form.Profesion ?? "").trim(),
        Estado: String(form.Estado ?? "").trim(),
        ROL: String(form.ROL ?? "").trim(),
      };

      // Aquí depende de tu servicio real. Yo lo dejo estándar:
      await trabajadoresService.update(id, payload);

      toast.success("Trabajador actualizado");
      onOpenChange(false);
      await onSaved();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "No se pudo actualizar el trabajador");
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
            <label className="text-sm">Email personal</label>
            <Input value={form.Email_PERSONAL} onChange={(e) => setField("Email_PERSONAL", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Email empresa</label>
            <Input value={form.Email_Empresa} onChange={(e) => setField("Email_Empresa", e.target.value)} />
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
            <label className="text-sm">Profesión</label>
            <Input value={form.Profesion} onChange={(e) => setField("Profesion", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Estado</label>
            <Input value={form.Estado} onChange={(e) => setField("Estado", e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Rol</label>
            <Input value={form.ROL} onChange={(e) => setField("ROL", e.target.value)} />
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
