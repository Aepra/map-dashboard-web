'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [origin, setOrigin] = useState('');
  const [basePrefix, setBasePrefix] = useState('');

  const dashboardItems = [
    {
      name: 'Registrasi',
      path: '/registrasi',
      description: 'Alur pendaftaran, input data, dan status awal.',
      badge: 'form',
    },
    {
      name: 'Demografi',
      path: '/demografi',
      description: 'Ringkasan data kependudukan dan distribusi.',
      badge: 'stats',
    },
    {
      name: 'Geospatial',
      path: '/geospatial',
      description: 'Peta interaktif dan layer visualisasi wilayah.',
      badge: 'map',
    },
    {
      name: 'Seragam Gratis',
      path: '/seragam-gratis',
      description: 'Halaman bantuan seragam dan monitoring distribusi.',
      badge: 'kit',
    },
    {
      name: 'Berkebutuhan Khusus',
      path: '/berkebutuhan-khusus',
      description: 'Data layanan dan kebutuhan khusus peserta.',
      badge: 'access',
    },
  ];

  useEffect(() => {
    setOrigin(window.location.origin);
    setBasePrefix(window.location.pathname.replace(/\/$/, ''));
  }, []);

  useEffect(() => {
    // Inject CSS to hide Next.js Dev Tools
    const styleId = 'hide-nextjs-dev-tools';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        /* Hide Next.js Dev Tools */
        button:has(svg[viewBox="0 0 24 24"]),
        button:has(img[alt*="next"]),
        [data-nextjs-dev-tools],
        .nextjs-dev-tools {
          display: none !important;
        }
        
        /* Hide button containers that might hold the dev tools */
        body > div > button,
        body > div:has(button:only-child) {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Also try to hide it via JavaScript
    const hideDevTools = () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        // Check if button is very small or positioned fixed (likely the N button)
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        
        if (style.position === 'fixed' || style.position === 'absolute') {
          btn.style.setProperty('display', 'none', 'important');
          btn.style.setProperty('visibility', 'hidden', 'important');
          btn.style.setProperty('pointer-events', 'none', 'important');
        }
      });
    };

    hideDevTools();
    // Rerun on any DOM change
    const observer = new MutationObserver(hideDevTools);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  const resolvePath = (path) => {
    return `${basePrefix}${path}`;
  };

  const resolveFullUrl = (path) => {
    const resolvedOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${resolvedOrigin}${resolvePath(path)}`;
  };

  const openPage = (path) => {
    const fullLink = resolveFullUrl(path);
    window.open(fullLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <main style={styles.shell}>
      <section style={styles.canvas}>
        <div style={styles.topGlowA} />
        <div style={styles.topGlowB} />

        <header style={styles.header}>
          <div>
            <div style={styles.kicker}>GitHub Console</div>
            <h1 style={styles.title}>Map Dashboard Index</h1>
            <p style={styles.subtitle}>
              Tampilan putih yang terasa seperti workspace coding, dengan URL builder, preview
              iframe, dan akses cepat ke lima halaman utama.
            </p>
          </div>

          <div style={styles.originBox}>
            <span style={styles.originLabel}>Domain aktif</span>
            <code style={styles.originCode}>{origin || 'menunggu domain...'}</code>
          </div>
        </header>

        <div style={styles.layout}>
          <section style={styles.listPane}>
            <div style={styles.cardList}>
              {dashboardItems.map((item) => {
                const targetPath = resolvePath(item.path);
                const fullLink = resolveFullUrl(item.path);
                const iframeCode = `<iframe src="${fullLink}" title="${item.name}" style="width: 100%; height: 720px; border: none; border-radius: 8px;"></iframe>`;

                return (
                  <article key={item.path} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div>
                        <div style={styles.badge}>{item.badge}</div>
                        <h3 style={styles.cardTitle}>{item.name}</h3>
                        <p style={styles.cardText}>{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPage(item.path)}
                        style={styles.openButton}
                        suppressHydrationWarning
                      >
                        Open
                      </button>
                    </div>

                    <div style={styles.boxSection}>
                      <div style={styles.boxLabel}>URL untuk embedding</div>
                      <div style={styles.boxGroup}>
                        <input
                          type="text"
                          value={fullLink}
                          readOnly
                          style={styles.codeBox}
                          suppressHydrationWarning
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(fullLink);
                            window.alert('URL disalin!');
                          }}
                          style={styles.copyButton}
                          suppressHydrationWarning
                        >
                          Salin URL
                        </button>
                      </div>
                    </div>

                    <div style={styles.boxSection}>
                      <div style={styles.boxLabel}>Kode iframe untuk embed</div>
                      <div style={styles.boxGroup}>
                        <textarea
                          value={iframeCode}
                          readOnly
                          style={{ ...styles.codeBox, minHeight: '80px' }}
                          suppressHydrationWarning
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(iframeCode);
                            window.alert('Kode iframe disalin!');
                          }}
                          style={styles.copyButton}
                          suppressHydrationWarning
                        >
                          Salin Iframe
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

const styles = {
  shell: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(9, 105, 218, 0.08), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%)',
    padding: '24px',
    color: '#0f172a',
  },
  canvas: {
    position: 'relative',
    width: 'min(1420px, 100%)',
    margin: '0 auto',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)',
    padding: '24px',
    overflow: 'visible',
  },
  topGlowA: {
    position: 'absolute',
    inset: '-120px auto auto -120px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'rgba(9, 105, 218, 0.09)',
    filter: 'blur(20px)',
    pointerEvents: 'none',
  },
  topGlowB: {
    position: 'absolute',
    inset: 'auto -80px -120px auto',
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    background: 'rgba(31, 41, 55, 0.06)',
    filter: 'blur(18px)',
    pointerEvents: 'none',
  },
  header: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  kicker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    color: '#374151',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  title: {
    margin: '12px 0 8px',
    fontSize: 'clamp(28px, 3vw, 42px)',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  subtitle: {
    margin: 0,
    maxWidth: '720px',
    color: '#475569',
    fontSize: '15px',
    lineHeight: 1.7,
  },
  originBox: {
    minWidth: '280px',
    padding: '14px 16px',
    borderRadius: '18px',
    border: '1px solid #e5e7eb',
    background: '#f8fafc',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
  },
  originLabel: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  originCode: {
    display: 'block',
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, Liberation Mono, monospace',
    fontSize: '13px',
    color: '#0f172a',
    wordBreak: 'break-all',
  },
  browserBar: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '12px',
    alignItems: 'center',
    padding: '14px 16px',
    marginBottom: '20px',
    borderRadius: '18px',
    border: '1px solid #e5e7eb',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 10px 32px rgba(15, 23, 42, 0.05)',
  },
  browserLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  browserInputWrap: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    padding: '10px 12px',
    borderRadius: '14px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  },
  browserPrefix: {
    flex: '0 0 auto',
    color: '#64748b',
    fontSize: '13px',
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, Liberation Mono, monospace',
    marginRight: '8px',
    whiteSpace: 'nowrap',
  },
  browserInput: {
    width: '100%',
    minWidth: 0,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, Liberation Mono, monospace',
    color: '#0f172a',
    background: 'transparent',
  },
  layout: {
    position: 'relative',
    zIndex: 1,
    display: 'block',
  },
  listPane: {
    minWidth: 0,
  },
  cardList: {
    display: 'grid',
    gap: '12px',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    background: '#ffffff',
    padding: '16px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '999px',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  cardTitle: {
    margin: '10px 0 6px',
    fontSize: '18px',
  },
  cardText: {
    margin: 0,
    color: '#475569',
    fontSize: '14px',
    lineHeight: 1.65,
    maxWidth: '420px',
  },
  boxSection: {
    marginBottom: '12px',
  },
  boxLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  boxGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  codeBox: {
    flex: '1',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, Liberation Mono, monospace',
    fontSize: '13px',
    color: '#0f172a',
    minWidth: '200px',
    resize: 'vertical',
  },
  copyButton: {
    flex: '0 0 auto',
    padding: '0 12px',
    height: '38px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  openButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 14px',
    height: '38px',
    borderRadius: '10px',
    border: '1px solid #0969da',
    background: '#0969da',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '14px',
    flex: '0 0 auto',
  },
};
