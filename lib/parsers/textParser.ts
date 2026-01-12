// Plain Text Parser implementation

export class TextParser {
  async extractText(file: File): Promise<string> {
    try {
      const text = await file.text();
      return text;
    } catch (error: any) {
      throw new Error(`Text parsing failed: ${error.message}`);
    }
  }
}

