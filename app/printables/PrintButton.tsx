'use client';

import { usePathname } from 'next/navigation';
import { gatePrintable } from './PrintableGate';
import PdfDownloadLink from './PdfDownloadLink';
import PDF_PAGES from '@/lib/printable-pdfs.json';

/* Print, plus "Download PDF" on every page listed in lib/printable-pdfs.json.
   Those PDFs are the page's own print view saved as a file, served at the
   page's address with .pdf on the end (see the rewrite in next.config.js).
   Pages with a hand-made PDF keep their own PdfDownloadLink and are not in
   the list. REBUILD the PDF when a listed page's print layout changes. */
const HAS_PDF = new Set(PDF_PAGES as string[]);

const pill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderRadius: '9999px',
  padding: '0.65rem 1.4rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function PrintButton() {
  const path = (usePathname() || '').replace(/\/$/, '');
  const printable = path.replace(/^\/printables\/?/, '') || 'printables';
  return (
    <span className="no-print" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'flex-end' }}>
      {HAS_PDF.has(path) && (
        <PdfDownloadLink
          href={`${path}.pdf`}
          printable={printable}
          style={{ ...pill, backgroundColor: '#ffffff', color: '#15803d', border: '2px solid #16a34a', textDecoration: 'none' }}
        >
          Download PDF
        </PdfDownloadLink>
      )}
      <button
        type="button"
        onClick={() => {
          // Email-gated since Nov 13, 2026 (owner decision): opens PrintableGate
          // until this browser has submitted an email.
          if (gatePrintable({ kind: 'print', printable })) window.print();
        }}
        style={{ ...pill, backgroundColor: '#16a34a', color: '#ffffff', border: '2px solid #16a34a' }}
      >
        🖨️ Print this page
      </button>
    </span>
  );
}
