import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Users, Search } from "lucide-react";

import { getTrabajadores } from "@/services/sharepointService";

/**
 * Modelo mínimo que usamos en la LISTA.
 * No tocamos nombres reales de SharePoint.
 */
interface Trabajador {
  id: string | number;
  nombreCompleto?: string;
  rut?: string;
  email?: string;
  estado?: string;
  nacimiento?: string;
}

/**
 * Calcula edad desde fecha de nacimiento (frontend puro)
 */
function calcularEdad(fecha?: string): number | null {
  if (!fecha) return null;

  const nacimiento = new Date(fecha);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

export default function Trabajadores() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      /**
       * getTrabajadores*
