import React, { useState } from 'react';

const TOC = [
  { label: '1  Personal',                        page: 3  },
  { label: '1.1  Rekrytering',                   page: 3,  sub: true },
  { label: '1.2  Uppträdande',                   page: 3,  sub: true },
  { label: '1.3  Ledigheter',                    page: 3,  sub: true },
  { label: '1.4  Medinflytande',                 page: 3,  sub: true },
  { label: '1.5  Kompetensutveckling',           page: 3,  sub: true },
  { label: '2  Underrättelse & Säkerhetstjänst', page: 4  },
  { label: '2.1  Inriktning underrättelsetj.',   page: 4,  sub: true },
  { label: '2.2  Rapportering',                  page: 4,  sub: true },
  { label: '2.3  Inriktning säkerhetstjänst',   page: 4,  sub: true },
  { label: '3  Genomförande / Stridsledning',    page: 4  },
  { label: '3.1  Beslut i stort',                page: 4,  sub: true },
  { label: '3.2  Riktlinjer',                    page: 5,  sub: true },
  { label: '3.3  Marsch / Transport',            page: 5,  sub: true },
  { label: '3.4  Förläggningsplats',             page: 6,  sub: true },
  { label: '3.5  Beredskapsgrader / Larmstyrka', page: 7, sub: true },
  { label: '3.6  Lösen',                         page: 7,  sub: true },
  { label: '3.7  Insatsregler',                  page: 8,  sub: true },
  { label: '3.8  Samordning',                    page: 8,  sub: true },
  { label: '4  Logistik & Underhåll',            page: 8  },
  { label: '4.1  Inriktning',                    page: 8,  sub: true },
  { label: '4.2  Förnödenheter',                 page: 8,  sub: true },
  { label: '4.3  Märkning',                      page: 9,  sub: true },
  { label: '4.4  Teknisk tjänst',                page: 9,  sub: true },
  { label: '5  Samverkan',                       page: 10 },
  { label: '5.1  Inriktning',                    page: 10, sub: true },
  { label: '6  Samband / Ledning',               page: 11 },
  { label: '6.1  Inriktning',                    page: 11, sub: true },
  { label: '6.2  Larmkedja',                     page: 11, sub: true },
  { label: '6.3  Sambandsöversikt',              page: 11, sub: true },
  { label: '6.4  Kanalplan, FAL-A',              page: 12, sub: true },
  { label: '6.5  Förbindelseprov',               page: 16, sub: true },
  { label: '6.6  Ordonnanser',                   page: 16, sub: true },
  { label: '7  Ledning',                         page: 16 },
  { label: '7.1  Inriktning',                    page: 16, sub: true },
  { label: '7.2  Karttjänst',                    page: 16, sub: true },
  { label: '7.3  Ordergivning',                  page: 16, sub: true },
  { label: '7.4  Lydnadsförhållanden',           page: 17, sub: true },
  { label: '7.5  Rapportering',                  page: 18, sub: true },
  { label: '7.6  Färdrapportering',              page: 18, sub: true },
  { label: '8  Utbildning / Övning',             page: 19 },
  { label: '9  Sjukvård',                        page: 19 },
  { label: '9.1  Sjukvårdstjänst',              page: 19, sub: true },
  { label: '9.2  Sjukvisitation',                page: 19, sub: true },
  { label: '9.3  Personlig hygien',              page: 19, sub: true },
  { label: '9.4  Sjukvårdsberedskap',            page: 19, sub: true },
  { label: '9.5  Djursjukvård',                  page: 20, sub: true },
  { label: 'Bilaga — Aktivering',                page: 21 },
  { label: 'Bilaga — Aktiveringsinstruktion',    page: 22 },
  { label: 'Bilaga — Hundtjänst',               page: 23 },
  { label: 'Bilaga — Marsch',                    page: 24 },
  { label: 'Bilaga — VB-instruktion',            page: 25 },
  { label: 'Bilaga — Individuell utveckling',    page: 27 },
  { label: 'Bilaga — Medinflytande',             page: 29 },
  { label: 'Bilaga — Onboarding',                page: 30 },
  { label: 'Bilaga — Stridspackninng',           page: 31 },
  { label: 'Bilaga — Trosspackning',             page: 32 },
];

const PDF_URL = '/docs/kompo.pdf';

export default function KompO() {
  const [currentPage, setCurrentPage] = useState(1);

  function goTo(page) {
    setCurrentPage(page);
    document.getElementById('pdf-frame').src = `${PDF_URL}#page=${page}`;
  }

  return (
    <div className="flex h-full">
      {/* TOC sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stående KompO</h2>
          <p className="text-xs text-gray-400 mt-0.5">Innehållsförteckning</p>
        </div>
        <nav className="py-2">
          {TOC.map((item, i) => (
            <button
              key={i}
              onClick={() => goTo(item.page)}
              className={`w-full text-left px-4 py-1.5 text-xs transition-colors hover:bg-gray-50
                ${item.sub ? 'pl-7 text-gray-500' : 'font-semibold text-gray-700'}
                ${currentPage === item.page ? 'bg-blue-50 text-military-navy' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* PDF viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
          <a href={PDF_URL} download className="text-xs text-military-steel hover:underline">
            Ladda ned PDF
          </a>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-400">Sida {currentPage} av 36</span>
        </div>
        <iframe
          id="pdf-frame"
          src={`${PDF_URL}#page=1`}
          className="flex-1 w-full border-0"
          title="Stående KompO"
        />
      </div>
    </div>
  );
}
