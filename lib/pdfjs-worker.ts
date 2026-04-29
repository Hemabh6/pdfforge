// pdfjs-dist 5.x creates workers with { type:"module" } automatically when workerSrc
// ends in .mjs (see PDFWorker source). Using workerPort with a singleton throws
// "Cannot use more than one PDFWorker per port" on the second call.
let _initialized = false;

export async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!_initialized) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    _initialized = true;
  }
  return pdfjsLib;
}
