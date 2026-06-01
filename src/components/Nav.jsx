import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', icon: '⬡', label: 'Dashboard' },
  { path: '/new', icon: '+', label: 'New Ad' },
  { path: '/evaluate', icon: '◎', label: 'Evaluate' }
]

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100
    }}>
      {tabs.map(t => {
        const active = location.pathname === t.path
        return (
          <button key={t.path} onClick={() => navigate(t.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '12px 0', background: 'transparent',
              color: active ? 'var(--accent)' : 'var(--text3)',
              gap: 3
            }}>
            <span style={{ fontSize: t.icon === '+' ? 22 : 18, fontWeight: t.icon === '+' ? 300 : 400, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
