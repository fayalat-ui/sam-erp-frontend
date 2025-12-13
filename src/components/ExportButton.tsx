import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportToExcel, ExportColumn } from '@/lib/excelExport';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  fileName: string;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  fileName,
  disabled = false
}) => {
  const handleExport = () => {
    exportToExcel(data, columns, fileName);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Exportar Excel
    </Button>
  );
};