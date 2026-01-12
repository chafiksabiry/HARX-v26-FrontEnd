// Word Document Parser implementation using Mammoth
import mammoth from 'mammoth';

export class DocParser {
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error: any) {
      throw new Error(`DOC parsing failed: ${error.message}`);
    }
  }
}

