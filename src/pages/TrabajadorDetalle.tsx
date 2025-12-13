import { useParams } from "react-router-dom";

export default function TrabajadorDetalle() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Detalle del Trabajador
      </h1>

      <p className="text-gray-600 mt-2">
        ID: {id}
      </p>
    </div>
  );
}
