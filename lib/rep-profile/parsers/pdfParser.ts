// PDF Parser implementation using pdf.js
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for Next.js
// Use dynamic import to load worker from pdfjs-dist package
if (typeof window !== 'undefined') {
  // Use the worker from public folder (copied from node_modules/pdfjs-dist/build/pdf.worker.min.mjs)
  // The file should be accessible at /pdf.worker.min.mjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  // Alternative: Use CDN with https protocol as fallback
  // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export class PDFParser {
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error: any) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }
}

