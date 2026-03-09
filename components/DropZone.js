'use client';
import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

export default function DropZone({ onFile, label, sublabel, accept = '.xlsx,.xls,.csv', disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (!file || disabled) return;
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handle(file);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-bright)'}`,
        borderRadius: 'var(--radius)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: dragging ? 'var(--accent-glow)' : 'var(--surface)',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        animation: dragging ? 'pulse-border 1s infinite' : 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handle(e.target.files?.[0])}
        disabled={disabled}
      />
      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
        {dragging
          ? <FileSpreadsheet size={32} color="var(--accent)" />
          : <Upload size={32} color="var(--text-dim)" />}
      </div>
      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: "'Space Mono', monospace" }}>
        {sublabel || 'Arraste ou clique para selecionar · .xlsx, .xls, .csv'}
      </p>
    </div>
  );
}
