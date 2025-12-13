import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, CheckCircle2, XCircle, Database } from 'lucide-react';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { sharePointClient } from '@/lib/sharepoint';
import { useNavigate } from 'react-router-dom';

type SiteInfo = {
  id?: string;
  name?: string;
  displayName?: string;
  webUrl?: string;
} | null;

type ListResult = {
  name: string;
  ok: boolean;
  count?: number;
  sample?: Record<string, unknown> | null;
  error?: string | null;
};

export default function TestSharePoint() {
  const { user, isAuthenticated, getAccessToken } = useSharePointAuth();
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(null);
  const [listsStatus, setListsStatus] = useState<ListResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTop, setFilterTop] = useState(1);
  const navigate = useNavigate();

  const listNamesToCheck = [
    SHAREPOINT_LISTS.TRABAJADORES,
    SHAREPOINT_LISTS.MANDANTES,
    SHAREPOINT_LISTS.SERVICIOS,
    SHAREPOINT_LISTS.VACACIONES,
    SHAREPOINT_LISTS.DIRECTIVAS,
    SHAREPOINT_LISTS.CLIENTES,
  ];

  const runDiagnostics = async () => {
    setLoading(true);
    const results: ListResult[] = [];
    try {
      // Token y perfil básico
      await getAccessToken().catch(() => null);

      // Inicializar sitio
      const site = (await sharePointClient.initializeSite()) as unknown as NonNullable<SiteInfo>;
      setSiteInfo(site);

      // Probar lectura básica por lista
      for (const listName of listNamesToCheck) {
        try {
          const items = (await sharePointClient.getListItems(listName, 'Id,Title', undefined, undefined, filterTop)) as Array<
            Record<string, unknown>
          >;
          results.push({
            name: listName,
            ok: true,
            count: items?.length || 0,
            sample: items?.[0] || null,
            error: null,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          results.push({
            name: listName,
            ok: false,
            error: msg,
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Diagnostics error:', msg);
    } finally {
      setListsStatus(results);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ejecutar al cargar por primera vez
    runDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Diagnóstico SharePoint</h1>
            <p className="text-gray-600">Verificación de autenticación y lectura de listas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/servicios')}>Servicios</Button>
          <Button variant="outline" onClick={() => navigate('/clientes')}>Clientes</Button>
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? 'Ejecutando...' : 'Re-ejecutar diagnóstico'}
          </Button>
        </div>
      </div>

      {/* Estado de autenticación */}
      <Card>
        <CardHeader>
          <CardTitle>Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Badge className="bg-green-600">Autenticado</Badge>
            ) : (
              <Badge variant="destructive">No autenticado</Badge>
            )}
            {user?.displayName && <span className="text-sm text-gray-700">Usuario: {user.displayName}</span>}
            {user?.mail && <span className="text-sm text-gray-700">Email: {user.mail}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Información del sitio */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sitio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {siteInfo ? (
            <div className="text-sm text-gray-700">
              <div>Site ID: {siteInfo?.id}</div>
              <div>Site Name: {siteInfo?.name || siteInfo?.displayName}</div>
              <div>Web URL: {siteInfo?.webUrl}</div>
            </div>
          ) : (
            <div className="text-gray-500">No disponible</div>
          )}
        </CardContent>
      </Card>

      {/* Parámetros */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de Prueba</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Items por lista (top):</span>
          </div>
          <Input
            type="number"
            min={1}
            max={5}
            value={filterTop}
            onChange={(e) => setFilterTop(Number(e.target.value))}
            className="w-24"
          />
          <Button onClick={runDiagnostics} disabled={loading}>Aplicar</Button>
        </CardContent>
      </Card>

      {/* Resultados por lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listsStatus.map((res) => (
          <Card key={res.name} className={res.ok ? 'border-green-200' : 'border-red-200'}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {res.ok ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                {res.name}
              </CardTitle>
              <Badge variant={res.ok ? 'default' : 'destructive'}>{res.ok ? 'OK' : 'ERROR'}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {res.ok ? (
                <>
                  <div>Items: {res.count}</div>
                  {res.sample ? (
                    <pre className="bg-gray-50 rounded p-2 overflow-auto">{JSON.stringify(res.sample, null, 2)}</pre>
                  ) : (
                    <div className="text-gray-500">Sin datos</div>
                  )}
                </>
              ) : (
                <div className="text-red-700">Error: {res.error}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}