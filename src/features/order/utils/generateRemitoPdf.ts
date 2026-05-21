import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generateRemitoPdf(elementId: string, orderId: string): Promise<File> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Remito element #${elementId} not found`);

  // Override the @media screen { display:none } rule temporarily so html2canvas
  // can measure and render the layout. Positioned off-screen to avoid flash.
  const savedStyle = el.getAttribute('style') ?? '';
  el.style.setProperty('display', 'block', 'important');
  el.style.setProperty('position', 'absolute', 'important');
  el.style.setProperty('top', '-99999px', 'important');
  el.style.setProperty('left', '0', 'important');
  el.style.setProperty('width', '794px', 'important');
  el.style.setProperty('background-color', '#ffffff', 'important');
  el.style.setProperty('z-index', '-1', 'important');

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();   // 210 mm
    const pageH = pdf.internal.pageSize.getHeight();  // 297 mm
    const imgHeightMm = (canvas.height / canvas.width) * pageW;

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.92),
      'JPEG',
      0,
      0,
      pageW,
      Math.min(imgHeightMm, pageH),
    );

    const blob = pdf.output('blob');
    return new File([blob], `Remito_Pedido_${orderId}.pdf`, { type: 'application/pdf' });
  } finally {
    if (savedStyle) {
      el.setAttribute('style', savedStyle);
    } else {
      el.removeAttribute('style');
    }
  }
}
