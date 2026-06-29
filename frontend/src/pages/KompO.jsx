import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDF_URL = '/docs/kompo.pdf';

const TOC = [
  { label: '1  Personal',                         page: 3  },
  { label: '1.1  Rekrytering',                    page: 3,  sub: true },
  { label: '1.2  Uppträdande',                    page: 3,  sub: true },
  { label: '1.3  Ledigheter',                     page: 3,  sub: true },
  { label: '1.4  Medinflytande',                  page: 3,  sub: true },
  { label: '1.5  Kompetensutveckling',            page: 3,  sub: true },
  { label: '2  Underrättelse & Säkerhetstjänst',  page: 4  },
  { label: '2.1  Inriktning underrättelsetj.',    page: 4,  sub: true },
  { label: '2.2  Rapportering',                   page: 4,  sub: true },
  { label: '2.3  Inriktning säkerhetstjänst',    page: 4,  sub: true },
  { label: '3  Genomförande / Stridsledning',     page: 4  },
  { label: '3.1  Beslut i stort',                 page: 4,  sub: true },
  { label: '3.2  Riktlinjer',                     page: 5,  sub: true },
  { label: '3.3  Marsch / Transport',             page: 5,  sub: true },
  { label: '3.4  Förläggningsplats',              page: 6,  sub: true },
  { label: '3.5  Beredskapsgrader / Larmstyrka',  page: 7,  sub: true },
  { label: '3.6  Lösen',                          page: 7,  sub: true },
  { label: '3.7  Insatsregler',                   page: 8,  sub: true },
  { label: '3.8  Samordning',                     page: 8,  sub: true },
  { label: '4  Logistik & Underhåll',             page: 8  },
  { label: '4.1  Inriktning',                     page: 8,  sub: true },
  { label: '4.2  Förnödenheter',                  page: 8,  sub: true },
  { label: '4.3  Märkning',                       page: 9,  sub: true },
  { label: '4.4  Teknisk tjänst',                 page: 9,  sub: true },
  { label: '5  Samverkan',                        page: 10 },
  { label: '5.1  Inriktning',                     page: 10, sub: true },
  { label: '6  Samband / Ledning',                page: 11 },
  { label: '6.1  Inriktning',                     page: 11, sub: true },
  { label: '6.2  Larmkedja',                      page: 11, sub: true },
  { label: '6.3  Sambandsöversikt',               page: 11, sub: true },
  { label: '6.4  Kanalplan, FAL-A',               page: 12, sub: true },
  { label: '6.5  Förbindelseprov',                page: 16, sub: true },
  { label: '6.6  Ordonnanser',                    page: 16, sub: true },
  { label: '7  Ledning',                          page: 16 },
  { label: '7.1  Inriktning',                     page: 16, sub: true },
  { label: '7.2  Karttjänst',                     page: 16, sub: true },
  { label: '7.3  Ordergivning',                   page: 16, sub: true },
  { label: '7.4  Lydnadsförhållanden',            page: 17, sub: true },
  { label: '7.5  Rapportering',                   page: 18, sub: true },
  { label: '7.6  Färdrapportering',               page: 18, sub: true },
  { label: '8  Utbildning / Övning',              page: 19 },
  { label: '9  Sjukvård',                         page: 19 },
  { label: '9.1  Sjukvårdstjänst',               page: 19, sub: true },
  { label: '9.2  Sjukvisitation',                 page: 19, sub: true },
  { label: '9.3  Personlig hygien',               page: 19, sub: true },
  { label: '9.4  Sjukvårdsberedskap',             page: 19, sub: true },
  { label: '9.5  Djursjukvård',                   page: 20, sub: true },
  { label: 'Bilaga — Aktivering',                 page: 21 },
  { label: 'Bilaga — Aktiveringsinstruktion',     page: 22 },
  { label: 'Bilaga — Hundtjänst',                page: 23 },
  { label: 'Bilaga — Marsch',                     page: 24 },
  { label: 'Bilaga — VB-instruktion',             page: 25 },
  { label: 'Bilaga — Individuell utveckling',     page: 27 },
  { label: 'Bilaga — Medinflytande',              page: 29 },
  { label: 'Bilaga — Onboarding',                 page: 30 },
  { label: 'Bilaga — Stridspackninng',            page: 31 },
  { label: 'Bilaga — Trosspackning',              page: 32 },
];

export default function KompO() {
  const [numPages, setNumPages]     = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [width, setWidth]           = useState(800);
  const containerRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      if (entries[0]) setWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  function goTo(page) {
    setPageNumber(page);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* TOC */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stående KompO</h2>
          <p className="text-xs text-gray-400 mt-0.5">Innehållsförteckning</p>
        </div>
        <nav className="overflow-y-auto py-2 flex-1">
          {TOC.map((item, i) => (
            <button
              key={i}
              onClick={() => goTo(item.page)}
              className={`w-full text-left py-1 text-xs transition-colors hover:bg-gray-50
                ${item.sub ? 'pl-6 text-gray-500' : 'px-4 font-semibold text-gray-700'}
                ${pageNumber === item.page ? 'bg-blue-50 text-military-navy' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 shrink-0">
          <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40">
            ← Föregående
          </button>
          <span className="text-xs text-gray-500">
            Sida {pageNumber} av {numPages || '…'}
          </span>
          <button onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
                  disabled={pageNumber >= (numPages || 1)}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40">
            Nästa →
          </button>
          <a href={PDF_URL} download
             className="ml-auto text-xs text-military-steel hover:underline">
            Ladda ned
          </a>
        </div>

        {/* PDF canvas */}
        <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-100 flex justify-center p-4">
          <Document
            file={PDF_URL}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p className="text-sm text-gray-400 mt-10">Laddar…</p>}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(width - 32, 900)}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
