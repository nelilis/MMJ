/* PDF.js wird erst für die Vorschau geladen; sämtliche Dateien bleiben lokal. */
(() => {
  const workerUrl = new URL('assets/vendor/pdfjs/pdf.worker.min.mjs', document.currentScript.src).href;
  let library;
  function loadLibrary() {
    if (!library) {
      library = import('./assets/vendor/pdfjs/pdf.min.mjs').then(pdfjs => {
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        return pdfjs;
      }).catch(error => { library = null; throw error; });
    }
    return library;
  }
  window.renderWaiverPreview = async (blob, container, isCurrent) => {
    const pdfjs = await loadLibrary();
    if (!isCurrent()) return;
    const loading = pdfjs.getDocument({data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false});
    let document;
    try {
      document = await loading.promise;
      if (!isCurrent()) return;
      container.replaceChildren();
      container.setAttribute('aria-busy', 'true');
      for (let number = 1; number <= document.numPages; number++) {
        if (!isCurrent()) return;
        const page = await document.getPage(number);
        if (!isCurrent()) return;
        const base = page.getViewport({scale: 1});
        // Auch beim Vergrößern auf dem Handy bleibt der Text scharf.
        const viewport = page.getViewport({scale: Math.min(1600, Math.max(1000, container.clientWidth * 2)) / base.width});
        const figure = window.document.createElement('figure');
        figure.className = 'pdf-preview-page';
        const caption = window.document.createElement('figcaption');
        caption.textContent = `Seite ${number} von ${document.numPages}`;
        const canvas = window.document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `PDF-Seite ${number} von ${document.numPages}. Über „PDF öffnen“ ist das vollständige Dokument zugänglich.`);
        figure.append(caption, canvas);
        container.append(figure);
        await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
        page.cleanup();
      }
    } finally {
      if (isCurrent()) container.setAttribute('aria-busy', 'false');
      await loading.destroy();
    }
  };
})();
