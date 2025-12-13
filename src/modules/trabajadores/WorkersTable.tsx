import { calcularEdad } from "./worker.utils";

export default function WorkersTable({ workers, onSelect }: any) {
  return (
    <table className="w-full bg-white border rounded">
      <thead className="bg-slate-50 text-left">
        <tr>
          <th className="p-3">Nombre completo</th>
          <th className="p-3">RUT</th>
          <th className="p-3">Email</th>
          <th className="p-3">Estado</th>
          <th className="p-3">Nacimiento</th>
          <th className="p-3">Edad</th>
        </tr>
      </thead>
      <tbody>
        {workers.map((w: any) => (
          <tr
            key={w.Id}
            onClick={() => onSelect(w.Id)}
            className="cursor-pointer hover:bg-slate-100"
          >
            <td className="p-3">{w.NOMNRE_COMPLETO}</td>
            <td className="p-3">{w.N_documento}</td>
            <td className="p-3">{w.Email_Empresa}</td>
            <td className="p-3">{w.Estado}</td>
            <td className="p-3">{w.NACIMIENTO?.slice(0, 10)}</td>
            <td className="p-3">
              {calcularEdad(w.NACIMIENTO) ?? "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
