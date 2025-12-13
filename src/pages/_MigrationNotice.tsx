import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function MigrationNotice({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-yellow-800">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-800">
            Este módulo está en proceso de migración a SharePoint. Vuelve más tarde o contacta al administrador para más detalles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}