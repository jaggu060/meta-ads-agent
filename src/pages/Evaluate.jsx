import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { claudeCall, getDemoData } from '../utils/api'

const isDemo = () => JSON.parse(localStorage.getItem('ads_config') || '{}').demo

function ScoreRing({ score }) {
  const r = 42, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : 'var(--red)'
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg4)" strokeWidth="8" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="55" y="52" textAnchor="middle" fill={color} fontSize="22" fontWeight="800" fontFamily="Syne">{score}</text>
      <text x="55" y="66" textAnchor="middle" fill="var(--text3)" fontSize="11" fontFamily="Syne">/100</text>
    </svg>
  )
}

export default function Evaluate() {
  const location = useLocation()
  const navigate = useNavigate()
  const campaign = location.state?.campaign
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chartData] = useState(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(d => ({ day: d, reach: Math.floor(Math.random() * 8000 + 2000), clicks: Math.floor(Math.random() * 200 + 50) }))
  })

  const evaluate = async () => {
    if (!campaign) return
    setLoading(true)
    try {
      const reach = campaign.reach || 28000
      const ctr = campaign.ctr || 1.8
      const cpm = campaign.cpm || 45
      const spend = campaign.spend || (campaign.daily_budget || 50000) / 100

      const prompt = `You are a Meta Ads performance analyst. Evaluate this ad campaign and return ONLY valid JSON (no markdown):

Campaign: ${campaign.name}
Objective: ${campaign.objective || 'REACH'}
Reach: ${reach}
CTR: ${ctr}%
CPM: ₹${cpm}
Total Spend: ₹${spend}
Status: ${campaign.status}

Return JSON:
{
  "reachScore": number (0-100),
  "ctrScore": number (0-100),
  "efficiencyScore": number (0-100),
  "overallScore": number (0-100),
  "grade": "A / B / C / D / F",
  "summary": "2 sentence overall assessment",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "recommendation": "SCALE | OPTIMIZE | PAUSE",
  "recommendationReason": "1-2 sentences explaining why"
}`

      let result
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 2000))
        result = getDemoData().evaluation(campaign)
      } else {
        const res = await claudeCall(prompt)
        const clean = res.replace(/```json|```/g, '').trim()
        result = JSON.parse(clean)
      }
      setAnalysis(result)
    } catch (e) {
      alert('Evaluation error: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => { if (campaign) evaluate() }, [])

  const recColor = { SCALE: 'var(--green)', OPTIMIZE: 'var(--yellow)', PAUSE: 'var(--red)' }

  if (!campaign) return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>No campaign selected</div>
      <button onClick={() => navigate('/')} style={{ background: 'var(--accent)', color: '#fff', padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>← Go Back</button>
    </div>
  )

  return (
    <div style={{ padding: '24px 20px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>⬡ Evaluation</div>
        <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>{campaign.name}</div>
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>7-Day Reach</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text3)', fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontFamily: 'Syne' }} />
            <Line type="monotone" dataKey="reach" stroke="var(--accent)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 28, marginBottom: 12, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⬡</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>AI is analyzing your campaign...</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Scoring reach, CTR, and efficiency</div>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      )}

      {analysis && (
        <>
          {/* Score cards */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ScoreRing score={analysis.overallScore} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Overall Grade</div>
                <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: analysis.overallScore >= 70 ? 'var(--green)' : analysis.overallScore >= 40 ? 'var(--yellow)' : 'var(--red)' }}>{analysis.grade}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>{analysis.summary}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Reach', score: analysis.reachScore },
              { label: 'CTR', score: analysis.ctrScore },
              { label: 'Efficiency', score: analysis.efficiencyScore }
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.score >= 70 ? 'var(--green)' : m.score >= 40 ? 'var(--yellow)' : 'var(--red)' }}>{m.score}</div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div style={{ background: `rgba(${analysis.recommendation === 'SCALE' ? '0,196,140' : analysis.recommendation === 'PAUSE' ? '255,59,59' : '255,184,0'},0.08)`, border: `1px solid rgba(${analysis.recommendation === 'SCALE' ? '0,196,140' : analysis.recommendation === 'PAUSE' ? '255,59,59' : '255,184,0'},0.25)`, borderRadius: 'var(--radius)', padding: '16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Recommendation</div>
              <span style={{ background: recColor[analysis.recommendation], color: '#000', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 4 }}>{analysis.recommendation}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{analysis.recommendationReason}</div>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px' }}>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>✓ Strengths</div>
              {analysis.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>)}
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px' }}>
              <div style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>↑ Improve</div>
              {analysis.improvements.map((s, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>)}
            </div>
          </div>

          <button onClick={() => navigate('/new')} style={{ width: '100%', background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
            Create Optimized Campaign →
          </button>
        </>
      )}
    </div>
  )
}
