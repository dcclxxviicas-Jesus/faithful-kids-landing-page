'use client';

import { requestPostActionCapture } from './PostActionCapture';

export default function PrintButton() {
  return (
    <button
      type="button"
      className="no-print"
      onClick={() => {
        // Request first so the afterprint listener exists before the dialog opens.
        requestPostActionCapture({
          kind: 'print',
          printable: window.location.pathname.replace(/^\/printables\/?/, '') || 'printables',
        });
        window.print();
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
