'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { gatePrintable } from './PrintableGate';
import PdfDownloadLink from './PdfDownloadLink';
import PDF_PAGES from '@/lib/printable-pdfs.json';

/* The one Download PDF + Print pair used on every printables page.

   - Pages listed in lib/printable-pdfs.json get "Download PDF" pointing at
     the page's own address plus .pdf (their print view saved as a file; see
     the rewrite in next.config.js). REBUILD that PDF when the page's print
     layout changes.
   - Pages with a hand-made PDF pass it in as `pdf`, so their download sits in
     the same pair instead of a separate, differently shaped button.

   Owner's rule (Nov 17, 2026): the two buttons should look like a pair,
   similar but not identical. Same pill shape, height and type; the download
   is filled green, Print is the green outline. Both are email-gated
   (PdfDownloadLink and gatePrintable). */
const HAS_PDF = new Set(PDF_PAGES as string[]);

const pill = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  minHeight: 46,
  boxSizing: 'border-box',
  borderRadius: 9999,
  padding: '0.6rem 1.35rem',
  fontSize: '0.98rem',
  fontWeight: 800,
  lineHeight: 1.2,
  textDecoration: 'none',
  cursor: 'pointer',
  border: '2px solid #16a34a',
  boxShadow: '0 3px 0 #15803d',
  fontFamily: 'inherit',
} as const;

export default function PrintButton({
  pdf,
  align = 'end',
}: {
  pdf?: { href: string; label: ReactNode; printable?: string };
  align?: 'start' | 'end';
}) {
  const path = (usePathname() || '').replace(/\/$/, '');
  const printable = path.replace(/^\/printables\/?/, '') || 'printables';
  const download = pdf ?? (HAS_PDF.has(path) ? { href: `${path}.pdf`, label: 'Download PDF' } : null);
  return (
    <span
      className="no-print fk-print-pair"
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', justifyContent: align === 'start' ? 'flex-start' : 'flex-end' }}
    >
      {download && (
        <PdfDownloadLink
          href={download.href}
          printable={download.printable ?? printable}
          style={{ ...pill, backgroundColor: '#16a34a', color: '#ffffff' }}
        >
          <span aria-hidden="true">⬇</span> {download.label}
        </PdfDownloadLink>
      )}
      <button
        type="button"
        onClick={() => {
          // Email-gated since Nov 13, 2026 (owner decision): opens PrintableGate
          // until this browser has submitted an email.
          if (gatePrintable({ kind: 'print', printable })) window.print();
        }}
        style={{ ...pill, backgroundColor: '#ffffff', color: '#15803d' }}
      >
        <span aria-hidden="true">🖨️</span> Print this page
      </button>
    </span>
  );
}
