import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { KitchenCategory } from '../api/kitchen.types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../utils/kitchen.utils';

interface Props {
  categories: KitchenCategory[];
  date: string;
}

const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const PdfExportButton = ({ categories, date }: Props) => {
  const handleExport = () => {
    const doc = new jsPDF();
    const title = `Producción — ${formatDate(date)}`;

    doc.setFontSize(16);
    doc.text(title, 14, 20);

    let y = 30;

    for (const cat of categories) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`${CATEGORY_LABELS[cat.category] ?? cat.category} (${cat.totalQuantity} u.)`, 14, y);
      y += 6;

      const rows = cat.groups.map((group) => {
        const statusSummary = Object.entries(
          group.items.reduce<Record<string, number>>((acc, item) => {
            acc[item.status] = (acc[item.status] ?? 0) + item.quantity;
            return acc;
          }, {}),
        )
          .map(([s, q]) => `${q} ${STATUS_LABELS[s as keyof typeof STATUS_LABELS]}`)
          .join(', ');

        return [group.productName, group.presentation, String(group.totalQuantity), statusSummary];
      });

      autoTable(doc, {
        startY: y,
        head: [['Producto', 'Presentación', 'Cant.', 'Estado']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [80, 80, 200] },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    doc.save(`produccion-${date}.pdf`);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<PictureAsPdfIcon />}
      onClick={handleExport}
      disabled={categories.length === 0}
    >
      Exportar PDF
    </Button>
  );
};
