// PDF Parser implementation using pdf.js
import * as pdfjsLib from 'pdfjs-dist';

// Define the worker src relative to public directory
// Ensure you copy node_modules/pdfjs-dist/build/pdf.worker.min.mjs to public/pdf.worker.min.mjs
// Or use CDN
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Better approach for Next.js:
// We will set this in the component or effect where it's used, but setting it here is also common.
// Since pdfjs-dist 4.x, worker setup might be different.
// For now, let's stick to CDN to avoid complex webpack config issues during this rapid migration.
// Note: pdfjsLib.version might not be available at runtime depending on build, hardcoding if needed.
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export class PDFParser {
  constructor() {
     // workerSrc should be set globally, ideally. 
     // For safety, we can check if it's set.
     if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        // Fallback to CDN or local
        // NOTE: In Next.js, 'pdfjs-dist/build/pdf.worker.min.mjs' is the worker.
        // We can try to rely on dynamic import or CDN.
        // Let's use CDN for simplicity as in the original code.
        const version = pdfjsLib.version || '3.11.174'; // Fallback version if not defined
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
     }
  }

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

