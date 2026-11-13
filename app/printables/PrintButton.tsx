'use client';

import { gatePrintable } from './PrintableGate';

export default function PrintButton() {
  return (
    <button
      type="button"
      className="no-print"
      onClick={() => {
        // Email-gated since Nov 13, 2026 (owner decision): opens PrintableGate
        // until this browser has submitted an email.
        const printable = window.location.pathname.replace(/^\/printables\/?/, '') || 'printables';
        if (gatePrintable({ kind: 'print', printable })) window.print();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#16a34a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '9999px',
        padding: '0.65rem 1.4rem',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      🖨️ Print this page
    </button>
  );
}
