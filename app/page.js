'use client';

import { useState, useEffect } from 'react';
import {
  Database, RefreshCw, CheckCircle2, Loader2,
  Trash2, FileBarChart2, AlertTriangle, X
} from 'lucide-react';
import DropZone from '../components/DropZone';
import Report from '../components/Report';
import { parseSpreadsheet, compareSheets, summarizeReport, saveMaster, loadMaster, clearMaster } from '../lib/sheetUtils';

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 16, height: 16,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

function Toast({ msg, type, onClose }) {
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--accent)' };
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      background: 'var(--surface2)', border: `1px solid ${colors[type] || 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      color: 'var(--text)', fontSize: '0.85rem',
      boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
      animation: 'fadeUp 0.3s ease forwards',
      zIndex: 999, maxWidth: 360,
    }}>
      <span style={{ color: colors[type], flexShrink: 0 }}>
        {type === 'success' && <CheckCircle2 size={16} />}
        {type === 'error' && <AlertTriangle size={16} />}
        {type === 'info' && <Loader2 size={16} />}
      </span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function Home() {
  const [master, setMaster] = useState(null);         // { name, sheets }
  const [masterLoading, setMasterLoading] = useState(false);
  const [compLoading, setCompLoading] = useState(false);
  const [report, setReport] = useState(null);          // comparison result
  const [summary, setSummary] = useState(null);
  const [compName, setCompName] = useState('');
  const [toast, setToast] = useState(null);
  const [replacing, setReplacing] = useState(false);

  // Load master from localStorage on mount
  useEffect(() => {
    const saved = loadMaster();
    if (saved) setMaster(saved);
  }, []);

  const showToast = (msg, type = 'info', ms = 3500) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), ms);
  };

  const handleMasterUpload = async (file) => {
    setMasterLoading(true);
    try {
      const data = await parseSpreadsheet(file);
      saveMaster(data);
      setMaster(data);
      setReport(null);
      setSummary(null);
      setReplacing(false);
      showToast(`Planilha mestre salva: ${file.name}`, 'success');
    } catch (e) {
      showToast('Erro ao processar planilha. Verifique o formato.', 'error');
    } finally {
      setMasterLoading(false);
    }
  };

  const handleCompUpload = async (file) => {
    setCompLoading(true);
    setReport(null);
    setSummary(null);
    try {
      const data = await parseSpreadsheet(file);
      const result = compareSheets(master, data);
      const sum = summarizeReport(result);
      setReport(result);
      setSummary(sum);
      setCompName(file.name);
      showToast(
        sum.total === 0
          ? 'Nenhuma diferença encontrada!'
          : `${sum.total} mudança${sum.total !== 1 ? 's' : ''} encontrada${sum.total !== 1 ? 's' : ''}`,
        sum.total === 0 ? 'success' : 'info'
      );
    } catch (e) {
      showToast('Erro ao processar planilha de comparação.', 'error');
    } finally {
      setCompLoading(false);
    }
  };

  const handleClearMaster = () => {
    clearMaster();
    setMaster(null);
    setReport(null);
    setSummary(null);
    showToast('Planilha mestre removida.', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileBarChart2 size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            Sheet<span style={{ color: 'var(--accent)' }}>Sync</span>
          </span>
        </div>

        {master && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.75rem', fontFamily: "'Space Mono', monospace",
            color: 'var(--green)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            Mestre ativo
          </div>
        )}
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Hero */}
        <div style={{ marginBottom: '3rem', animation: 'fadeUp 0.5s ease forwards' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
          }}>
            Compare planilhas<br />
            <span style={{ color: 'var(--accent)' }}>com precisão.</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', maxWidth: 480, lineHeight: 1.6 }}>
            Suba uma planilha mestre e compare qualquer versão futura. Todas as mudanças, linha a linha.
          </p>
        </div>

        {/* MASTER SECTION */}
        <section style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: '1.5rem',
          overflow: 'hidden',
          animation: 'fadeUp 0.5s 0.1s ease both',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Planilha Mestre</span>
            </div>

            {master && !replacing && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setReplacing(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <RefreshCw size={12} /> Trocar mestre
                </button>
                <button
                  onClick={handleClearMaster}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--red)', fontSize: '0.78rem', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--red)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Trash2 size={12} /> Remover
                </button>
              </div>
            )}

            {replacing && (
              <button
                onClick={() => setReplacing(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer',
                }}
              >
                <X size={12} /> Cancelar
              </button>
            )}
          </div>

          <div style={{ padding: '1.25rem' }}>
            {master && !replacing ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1rem',
                background: 'var(--green-dim)', borderRadius: 'var(--radius)',
                border: '1px solid rgba(0,229,160,0.2)',
              }}>
                <CheckCircle2 size={18} color="var(--green)" />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green)' }}>
                    {master.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                    {master.sheets.length} aba{master.sheets.length !== 1 ? 's' : ''} ·{' '}
                    {master.sheets.reduce((a, s) => a + s.rows.length, 0)} linhas no total
                  </p>
                </div>
              </div>
            ) : (
              <>
                {replacing && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--yellow)', marginBottom: '0.75rem', fontFamily: "'Space Mono', monospace" }}>
                    ⚠ A planilha mestre atual será substituída.
                  </p>
                )}
                {masterLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    <Spinner /> <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>Processando...</span>
                  </div>
                ) : (
                  <DropZone
                    onFile={handleMasterUpload}
                    label="Subir planilha mestre"
                    sublabel="Esta será a base de comparação · .xlsx, .xls, .csv"
                  />
                )}
              </>
            )}
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: '2rem',
          overflow: 'hidden',
          animation: 'fadeUp 0.5s 0.2s ease both',
          opacity: master ? 1 : 0.4,
          pointerEvents: master ? 'auto' : 'none',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface2)',
          }}>
            <RefreshCw size={16} color="var(--text-dim)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Planilha de Comparação</span>
            {!master && (
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
                Defina a planilha mestre primeiro
              </span>
            )}
          </div>

          <div style={{ padding: '1.25rem' }}>
            {compLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                <Spinner /> <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>Comparando...</span>
              </div>
            ) : (
              <DropZone
                onFile={handleCompUpload}
                label="Subir planilha para comparar"
                sublabel="Será comparada com a planilha mestre ativa"
                disabled={!master || compLoading}
              />
            )}
          </div>
        </section>

        {/* REPORT */}
        {report && summary && (
          <section style={{ animation: 'fadeUp 0.5s ease forwards' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              marginBottom: '1.25rem',
            }}>
              <FileBarChart2 size={18} color="var(--accent)" />
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Relatório de Mudanças</h2>
            </div>
            <Report
              report={report}
              summary={summary}
              masterName={master?.name}
              compName={compName}
            />
          </section>
        )}
      </main>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
