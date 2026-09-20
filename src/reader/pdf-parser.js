// Client-side, self-contained PDF to Markup converter & text extractor
// Runs entirely inside the browser without third-party external services.

export class LocalPdfExtractor {
  constructor() {
    this.pdfLibReady = false;
  }

  /**
   * Reads an ArrayBuffer or File, extracts text items grouped by vertical positions and transforms into clean Markdown
   */
  async extractTextFromPdf(fileOrBuffer) {
    // If window.pdfjsLib is loaded from local bundle or script
    if (window.pdfjsLib) {
      return await this._parseWithPdfJs(fileOrBuffer);
    } else {
      // Fallback built-in stream parser for standard uncompressed/text stream PDFs
      return await this._parsePureJsFallback(fileOrBuffer);
    }
  }

  async _parseWithPdfJs(fileOrBuffer) {
    const data = fileOrBuffer instanceof ArrayBuffer 
      ? fileOrBuffer 
      : await fileOrBuffer.arrayBuffer();

    const loadingTask = window.pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pagesData = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Sort items by Y descending (top to bottom), then X ascending
      const items = textContent.items.sort((a, b) => {
        if (Math.abs(b.transform[5] - a.transform[5]) > 4) {
          return b.transform[5] - a.transform[5];
        }
        return a.transform[4] - b.transform[4];
      });

      let pageText = "";
      let lastY = null;
      let lastHeight = 0;

      for (const item of items) {
        const text = item.str.trim();
        if (!text) continue;

        const currentY = item.transform[5];
        const fontHeight = Math.hypot(item.transform[2], item.transform[3]) || 12;

        if (lastY !== null && Math.abs(lastY - currentY) > fontHeight * 1.2) {
          pageText += "\n\n";
        } else if (pageText && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
          pageText += " ";
        }

        // Detect potential headings based on font size
        if (fontHeight > 18) {
          pageText += `# ${text}\n`;
        } else if (fontHeight > 14) {
          pageText += `## ${text}\n`;
        } else {
          pageText += text;
        }

        lastY = currentY;
        lastHeight = fontHeight;
      }

      pagesData.push({
        pageNumber: i,
        content: pageText.trim()
      });
    }

    return {
      totalPages: numPages,
      pages: pagesData,
      markdown: pagesData.map(p => `<!-- Page ${p.pageNumber} -->\n\n${p.content}`).join("\n\n---\n\n")
    };
  }

  /**
   * Pure lightweight JS stream parser: extracts text streams directly from PDF bytes
   * Works on local client without requiring any external network or npm packages.
   */
  async _parsePureJsFallback(fileOrBuffer) {
    const buffer = fileOrBuffer instanceof ArrayBuffer
      ? fileOrBuffer
      : await fileOrBuffer.arrayBuffer();

    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer);

    // Extract lines inside parenthesis in BT (Begin Text) ... ET (End Text) blocks
    const matches = [];
    const textRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let match;
    while ((match = textRegex.exec(text)) !== null) {
      matches.push(match[1]);
    }

    let extracted = matches.join(" ").replace(/\\([()\\])/g, "$1").trim();
    if (!extracted) {
      extracted = "PDF loaded. (To render complex compressed PDFs with full OCR, use the built-in viewer mode or export text).";
    }

    return {
      totalPages: 1,
      pages: [{ pageNumber: 1, content: extracted }],
      markdown: `# Extracted Issue Content\n\n${extracted}`
    };
  }
}
