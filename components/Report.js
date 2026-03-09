'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus, Edit3, FileX, FilePlus } from 'lucide-react';

const TYPE_META = {
  added:        { label: 'Adicionado',   color: 'var(--green)',  bg: 'var(--green-dim)',  Icon: Plus },
  removed:      { label: 'Removido',     color: 'var(--red)',    bg: 'var(--red-dim)',    Icon: Minus },
  modified:     { label: 'Modificado',   color: 'var(--yellow)', bg: 'var(--yellow-dim)', Icon: Edit3 },
  sheet_added:  { label: 'Aba adicionada', color: 'var(--green)', bg: 'var(--green-dim)', Icon: FilePlus },
  sheet_removed:{ label: 'Aba removida',  color: 'var(--red)',   bg: 'var(--red-dim)',   Icon: FileX },
};

function Badge({ type }) {
  const m = TYPE_META[type];
  if (!m) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: '99px',
      background: m.bg, color: m.color,
      fontSize: '0.72rem', fontWeight: 700, fontFamily: "'Space Mono', monospace",
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      <m.Icon size={10} />
      {m.label}
    </span>
  );
}

function ChangeRow({ item }) {
  const [open, setOpen] = useState(false);
  const hasDetails = item.changes?.length > 0 || item.row;

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      transition: 'background 0.15s',
    }}>
      <div
        onClick={() => hasDetails && setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem',
          cursor: hasDetails ? 'pointer' : 'default',
          background: open ? 'var(--surface2)' : 'transparent',
        }}
      >
        {hasDetails
          ? (open ? <ChevronDown size={14} color="var(--text-dim)" /> : <ChevronRight size={14} color="var(--text-dim)" />)
          : <span style={{ width: 14 }} />
        }
        <Badge type={item.type} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.82rem', color: 'var(--text)', flex: 1 }}>
          {item.sheet}
          {item.key && <> · <strong style={{ color: 'var(--text-dim)' }}>{item.key}</strong></>}
        </span>
        {item.changes && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
            {item.changes.length} campo{item.changes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {open && (
        <div style={{ padding: '0 1rem 1rem 2.5rem' }}>
          {item.type === 'modified' && item.changes?.map((c, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem',
              padding: '0.5rem', marginBottom: '0.25rem',
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              fontSize: '0.78rem', fontFamily: "'Space Mono', monospace",
            }}>
              <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>{c.column}</span>
              <span style={{ color: 'var(--red)', textDecoration: 'line-through', wordBreak: 'break-all' }}>
                {c.from || <em style={{ opacity: 0.5 }}>vazio</em>}
              </span>
              <span style={{ color: 'var(--green)', wordBreak: 'break-all' }}>
                {c.to || <em style={{ opacity: 0.5 }}>vazio</em>}
              </span>
            </div>
          ))}
          {(item.type === 'added' || item.type === 'removed') && item.row && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
              padding: '0.5rem',
              background: 'var(--surface)', borderRadius: 'var(--radius)',
            }}>
              {Object.entries(item.row).map(([k, v]) => (
                <span key={k} style={{ fontSize: '0.75rem', fontFamily: "'Space Mono', monospace" }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                  <span style={{ color: 'var(--text)' }}>{v}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Report({ report, summary, masterName, compName }) {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Todos', count: summary.total },
    { id: 'modified', label: 'Modificados', count: summary.modified },
    { id: 'added', label: 'Adicionados', count: summary.added },
    { id: 'removed', label: 'Removidos', count: summary.removed },
  ];

  const visible = filter === 'all' ? report : report.filter((r) => r.type === filter);

  return (
    <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
      {/* Header stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Modificados', val: summary.modified, color: 'var(--yellow)' },
          { label: 'Adicionados', val: summary.added, color: 'var(--green)' },
          { label: 'Removidos', val: summary.removed, color: 'var(--red)' },
          { label: 'Total', val: summary.total, color: 'var(--accent)' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1rem',
            borderTop: `3px solid ${s.color}`,
          }}>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', fontFamily: "'Space Mono', monospace" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* File info */}
      <div style={{
        display: 'flex', gap: '0.5rem', alignItems: 'center',
        marginBottom: '1rem', fontSize: '0.78rem',
        fontFamily: "'Space Mono', monospace", color: 'var(--text-dim)',
        flexWrap: 'wrap',
      }}>
        <span style={{ padding: '0.2rem 0.5rem', background: 'var(--surface2)', borderRadius: 4 }}>{masterName}</span>
        <span>→</span>
        <span style={{ padding: '0.2rem 0.5rem', background: 'var(--accent-glow)', borderRadius: 4, color: 'var(--accent)' }}>{compName}</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: 99, border: '1px solid',
              borderColor: filter === f.id ? 'var(--accent)' : 'var(--border)',
              background: filter === f.id ? 'var(--accent-glow)' : 'transparent',
              color: filter === f.id ? 'var(--accent)' : 'var(--text-dim)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f.label} <span style={{ opacity: 0.6 }}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        overflow: 'hidden', background: 'var(--surface)',
      }}>
        {/* Column header for modified */}
        <div style={{
          display: 'grid', gridTemplateColumns: '14px 1fr 1fr 1fr',
          gap: '0.5rem', padding: '0.5rem 1rem',
          background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
          fontSize: '0.7rem', color: 'var(--text-muted)',
          fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'none',
        }} />

        {visible.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem' }}>
            Nenhuma mudança nesta categoria
          </div>
        ) : (
          visible.map((item, i) => <ChangeRow key={i} item={item} />)
        )}
      </div>
    </div>
  );
}
