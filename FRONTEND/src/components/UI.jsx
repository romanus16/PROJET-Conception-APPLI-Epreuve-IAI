import React from 'react'

// ── Button ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, icon, fullWidth, style: extraStyle, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', fontFamily: 'var(--font-sans)', fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .18s ease',
    borderRadius: 'var(--radius)', border: 'none', outline: 'none',
    width: fullWidth ? '100%' : undefined, whiteSpace: 'nowrap',
    opacity: loading ? 0.75 : 1,
  }
  const sizes = {
    sm: { padding: '7px 14px', fontSize: '13px' },
    md: { padding: '11px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' },
  }
  const variants = {
    primary:   { background: 'var(--orange)',    color: '#fff', boxShadow: '0 2px 8px rgba(240,124,30,.30)' },
    secondary: { background: 'var(--navy)',      color: '#fff' },
    ghost:     { background: 'transparent',      color: 'var(--navy)', border: '1.5px solid var(--gray-200)' },
    danger:    { background: 'var(--red)',        color: '#fff' },
    success:   { background: 'var(--green)',      color: '#fff' },
    outline:   { background: 'transparent',      color: 'var(--orange)', border: '1.5px solid var(--orange)' },
  }
  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size={16} color="#fff" /> : icon}
      {children}
    </button>
  )
}

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 24, color = 'var(--blue-mid)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2.5px solid transparent`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin .7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, style, hover, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: hovered && hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        border: '1px solid var(--gray-100)',
        transition: 'all .22s ease',
        transform: hovered && hover ? 'translateY(-3px)' : 'none',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue:   { background: '#dbeafe', color: '#1e40af' },
    orange: { background: '#ffedd5', color: '#c2410c' },
    green:  { background: 'var(--green-light)', color: '#166534' },
    red:    { background: 'var(--red-light)',   color: '#991b1b' },
    yellow: { background: 'var(--yellow-light)',color: '#92400e' },
    gray:   { background: 'var(--gray-100)',    color: 'var(--gray-600)' },
    navy:   { background: '#e0e7ff',            color: '#3730a3' },
  }
  const c = colors[color] || colors.blue
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '99px',
      fontSize: '12px', fontWeight: 600, ...c,
    }}>
      {children}
    </span>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, ...props }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--gray-400)', display: 'flex',
          }}>{icon}</div>
        )}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '11px 14px 11px 40px' : '11px 14px',
            border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--blue-mid)' : 'var(--gray-200)'}`,
            borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none',
            background: '#fff', color: 'var(--gray-800)', transition: 'border .15s',
            fontFamily: 'var(--font-sans)',
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)' }}>{label}</label>}
      <select
        style={{
          width: '100%', padding: '11px 14px',
          border: `1.5px solid ${error ? 'var(--red)' : 'var(--gray-200)'}`,
          borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none',
          background: '#fff', color: 'var(--gray-800)', fontFamily: 'var(--font-sans)', cursor: 'pointer',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,37,87,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px', animation: 'fadeIn .2s ease',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeUp .25s ease', boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--gray-100)',
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy)' }}>{title}</h3>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-100)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px', color: 'var(--gray-500)',
          }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────
export function Toast({ toasts, remove }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          padding: '12px 18px', borderRadius: 'var(--radius)', cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)', fontSize: '14px', fontWeight: 500,
          animation: 'fadeUp .25s ease', display: 'flex', alignItems: 'center', gap: '10px',
          background: t.type === 'error' ? '#fff1f1' : t.type === 'success' ? '#f0fdf4' : '#eff6ff',
          color:      t.type === 'error' ? 'var(--red)' : t.type === 'success' ? 'var(--green)' : 'var(--blue)',
          border: `1px solid ${t.type === 'error' ? '#fecaca' : t.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
          maxWidth: 360,
        }}>
          <span>{t.type === 'error' ? '✕' : t.type === 'success' ? '✓' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon || '📭'}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>{title}</h3>
      {subtitle && <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '20px' }}>{subtitle}</p>}
      {action}
    </div>
  )
}

// ── Pagination ──────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPageChange, hasPrevious, hasNext }) {
  if (totalPages <= 1) return null

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '24px',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious}
        style={{
          padding: '8px 12px',
          border: '1px solid var(--gray-200)',
          background: '#fff',
          borderRadius: 'var(--radius-sm)',
          cursor: hasPrevious ? 'pointer' : 'not-allowed',
          opacity: hasPrevious ? 1 : 0.5,
          fontSize: '13px'
        }}
      >
        ← Précédent
      </button>

      <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
        Page {page} sur {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        style={{
          padding: '8px 12px',
          border: '1px solid var(--gray-200)',
          background: '#fff',
          borderRadius: 'var(--radius-sm)',
          cursor: hasNext ? 'pointer' : 'not-allowed',
          opacity: hasNext ? 1 : 0.5,
          fontSize: '13px'
        }}
      >
        Suivant →
      </button>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = 'var(--navy)', sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      padding: '20px 22px', border: '1px solid var(--gray-100)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--radius)',
          background: color + '18', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '20px',
        }}>{icon}</div>
        <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ fontSize: '28px', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '6px' }}>{sub}</p>}
    </div>
  )
}

// ── DocumentViewer ──────────────────────────────────────────────────────────────
export function DocumentViewer({ url, filename, fileExtension, mimeType, canPreview, onClose }) {
  const renderPreview = () => {
    if (!canPreview || !mimeType) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>
            Aperçu non disponible
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '20px' }}>
            Ce type de fichier ({fileExtension}) ne peut pas être affiché dans le navigateur.
          </p>
          <a
            href={url}
            download
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--navy)', color: '#fff', padding: '10px 20px',
              borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 600,
              fontSize: '14px',
            }}
          >
            📥 Télécharger le fichier
          </a>
        </div>
      )
    }

    // PDF Viewer
    if (mimeType === 'application/pdf') {
      return (
        <div style={{ width: '100%', height: '70vh' }}>
          <iframe
            src={url}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius)' }}
            title={filename}
          />
        </div>
      )
    }

    // Image Viewer
    if (mimeType.startsWith('image/')) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', background: '#f8fafc', borderRadius: 'var(--radius)',
        }}>
          <img
            src={url}
            alt={filename}
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 'var(--radius)' }}
          />
        </div>
      )
    }

    // Text/CSV/HTML Viewer
    if (['text/plain', 'text/csv', 'text/html'].includes(mimeType)) {
      return (
        <div style={{
          background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius)',
          maxHeight: '70vh', overflow: 'auto', fontFamily: 'monospace',
          fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap',
        }}>
          <p style={{ color: 'var(--gray-500)', marginBottom: '12px', fontSize: '12px' }}>
            Aperçu du fichier : {filename}
          </p>
          <iframe
            src={url}
            style={{ width: '100%', height: '60vh', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}
            title={filename}
          />
        </div>
      )
    }

    return null
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,37,87,.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1001, padding: '24px', animation: 'fadeIn .2s ease',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: 900, maxHeight: '85vh', overflow: 'hidden',
          animation: 'fadeUp .25s ease', boxShadow: 'var(--shadow-2xl)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid var(--gray-100)',
          background: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius)',
              background: 'var(--navy)', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}>
              {mimeType?.startsWith('image/') ? '🖼️' : mimeType === 'application/pdf' ? '📄' : '📎'}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>{filename}</h3>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {fileExtension?.toUpperCase() || 'Fichier'} • {(mimeType || '').split('/')[1]?.toUpperCase() || 'Type inconnu'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={url}
              download
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--navy)', color: '#fff', padding: '8px 16px',
                borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 600,
                fontSize: '13px',
              }}
            >
              📥 Télécharger
            </a>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--gray-100)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px', color: 'var(--gray-500)',
            }}>×</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {renderPreview()}
        </div>
      </div>
    </div>
  )
}
