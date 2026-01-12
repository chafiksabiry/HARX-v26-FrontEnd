// Text file parser
export class TextParser {
  async extractText(file: File): Promise<string> {
    try {
      return await file.text();
    } catch (error: any) {
      throw new Error(`Text parsing failed: ${error.message}`);
    }
  }
}

