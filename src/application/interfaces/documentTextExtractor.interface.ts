export interface DocumentTextExtractor {
  extractText(document: Uint8Array): Promise<string>;
}
