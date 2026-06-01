import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { metaCall, getDemoData } from '../utils/api'

const isDemo = () => JSON.parse(localStorage.getItem('ads_config') || '{}').demo

const badge = (status) => {
  const map = { ACTIVE: ['var(--green)', '#001a0f'], PAUSED: ['var(--yellow)', '#1a1100'], ARCHIVED: ['var(--text3)', '#111'] }
  const [bg, text] = map[status] || ['var(--border)', '#555']
  return { background: bg, color: text, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5 }
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 600))
        setCampaigns(getDemoData().campaigns)
      } else {
        const data = await metaCall('getCampaigns', {})
        setCampaigns(data.data || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const totalSpend = campaigns.reduce((a, c) => a + parseFloat(c.spend || c.daily_budget || 0) / 100, 0)
  const active = campaigns.filter(c => c.status === 'ACTIVE').length

  return (
    <div style={{ padding: '24px 20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>⬡ Dashboard</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Your Campaigns</div>
        </div>
        <button onClick={() => load(true)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}>
          {refreshing ? '...' : '↻ Refresh'}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total', val: campaigns.length, unit: 'campaigns' },
          { label: 'Active', val: active, unit: 'running' },
          { label: 'Spend', val: `₹${totalSpend.toFixed(0)}`, unit: 'this week' }
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 12px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⬡</div>
          <div style={{ fontSize: 13 }}>Loading campaigns...</div>
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px dashed var(--border2)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📢</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No campaigns yet</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Create your first AI-powered ad campaign</div>
          <button onClick={() => navigate('/new')} style={{ background: 'var(--accent)', color: '#fff', padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 14 }}>
            + New Campaign
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.map(c => (
            <CampaignCard key={c.id} campaign={c} onEvaluate={() => navigate('/evaluate', { state: { campaign: c } })} />
          ))}
        </div>
      )}

      {campaigns.length > 0 && (
        <button onClick={() => navigate('/new')} style={{ position: 'fixed', bottom: 90, right: 20, background: 'var(--accent)', color: '#fff', width: 52, height: 52, borderRadius: '50%', fontSize: 24, fontWeight: 300, boxShadow: '0 4px 20px rgba(255,69,0,0.4)' }}>
          +
        </button>
      )}
    </div>
  )
}

function CampaignCard({ campaign, onEvaluate }) {
  const reach = campaign.reach || Math.floor(Math.random() * 40000 + 5000)
  const ctr = campaign.ctr || (Math.random() * 3 + 0.5).toFixed(2)

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{campaign.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{campaign.objective || 'REACH'}</div>
        </div>
        <span style={badge(campaign.status)}>{campaign.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Reach', val: reach.toLocaleString() },
          { label: 'CTR', val: `${ctr}%` },
          { label: 'Budget/day', val: `₹${((campaign.daily_budget || 50000) / 100).toFixed(0)}` }
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{m.val}</div>
          </div>
        ))}
      </div>

      <button onClick={onEvaluate} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '9px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
        AI EVALUATE →
      </button>
    </div>
  )
}
