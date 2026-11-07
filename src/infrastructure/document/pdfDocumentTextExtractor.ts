import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { DocumentTextExtractor } from "../../application/interfaces/documentTextExtractor.interface";

const moduleLoader = createRequire(__filename);
const standardFontDataUrl = `${join(
  dirname(moduleLoader.resolve("pdfjs-dist/package.json")),
  "standard_fonts",
).replace(/\\/g, "/")}/`;

export class PdfDocumentTextExtractor implements DocumentTextExtractor {
  async extractText(document: Uint8Array): Promise<string> {
    const loadingTask = getDocument({
      data: Uint8Array.from(document),
      standardFontDataUrl,
    });

    try {
      const pdf = await loadingTask.promise;
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) =>
            "str" in item ? `${item.str}${item.hasEOL ? "\n" : " "}` : "",
          )
          .join("")
          .trim();
        pages.push(text);
      }

      return pages.join("\n").trim();
    } finally {
      await loadingTask.destroy();
    }
  }
}
