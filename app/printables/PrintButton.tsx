'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      className="no-print"
      onClick={() => window.print()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#059669',
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
