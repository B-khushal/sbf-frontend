import html2pdf from 'html2pdf.js';

export const generatePDF = async (element: HTMLElement, filename: string) => {
  const opt = {
    margin: 1,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}; 