import React, { useState } from 'react'

const S = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', background: 'var(--bg)' },
  logo: { fontSize: 13, fontWeight: 700, letterSpacing: 4, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 },
  sub: { fontSize: 14, color: 'var(--text2)', marginBottom: 36, lineHeight: 1.6 },
  label: { fontSize: 12, fontWeight: 600, letterSpacing: 1, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  field: { marginBottom: 20 },
  hint: { fontSize: 11, color: 'var(--text3)', marginTop: 5, lineHeight: 1.5 },
  btn: { width: '100%', background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700, letterSpacing: 1, marginTop: 8 },
  skip: { width: '100%', background: 'var(--bg3)', color: 'var(--text2)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, marginTop: 10, border: '1px solid var(--border)' },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: 24 }
}

export default function Setup({ onDone }) {
  const [form, setForm] = useState({ anthropicKey: '', metaToken: '', adAccountId: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    localStorage.setItem('ads_configured', '1')
    localStorage.setItem('ads_config', JSON.stringify(form))
    onDone()
  }

  const demoMode = () => {
    localStorage.setItem('ads_configured', '1')
    localStorage.setItem('ads_config', JSON.stringify({ demo: true }))
    onDone()
  }

  return (
    <div style={S.wrap}>
      <div style={S.logo}>⬡ Meta Ads Agent</div>
      <div style={S.title}>Let's get<br />you set up.</div>
      <div style={S.sub}>Enter your credentials once. They're saved only on this device.</div>

      <div style={S.card}>
        <div style={S.field}>
          <label style={S.label}>Anthropic API Key</label>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={form.anthropicKey}
            onChange={e => set('anthropicKey', e.target.value)}
          />
          <div style={S.hint}>Get it from console.anthropic.com → API Keys</div>
        </div>

        <div style={S.field}>
          <label style={S.label}>Meta Access Token</label>
          <input
            type="password"
            placeholder="EAAxxxxxxxxx..."
            value={form.metaToken}
            onChange={e => set('metaToken', e.target.value)}
          />
          <div style={S.hint}>Get it from developers.facebook.com → Tools → Graph API Explorer</div>
        </div>

        <div style={S.field}>
          <label style={S.label}>Ad Account ID</label>
          <input
            placeholder="act_123456789"
            value={form.adAccountId}
            onChange={e => set('adAccountId', e.target.value)}
          />
          <div style={S.hint}>Found in Meta Business Manager → Ad Accounts</div>
        </div>
      </div>

      <button style={S.btn} onClick={save}>Save & Enter →</button>
      <button style={S.skip} onClick={demoMode}>Try Demo Mode (no credentials needed)</button>
    </div>
  )
}
