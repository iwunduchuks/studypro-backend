import mammoth from "mammoth";
import type { DocumentTextExtractor } from "../../application/interfaces/documentTextExtractor.interface";

export class DocxDocumentTextExtractor implements DocumentTextExtractor {
  async extractText(document: Uint8Array): Promise<string> {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(document),
    });
    return result.value.trim();
  }
}
