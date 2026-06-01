import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { claudeCall, metaCall, getDemoData } from '../utils/api'

const isDemo = () => JSON.parse(localStorage.getItem('ads_config') || '{}').demo

const steps = ['Brief', 'AI Draft', 'Review', 'Launch']

const S = {
  wrap: { padding: '24px 20px 0' },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  field: { marginBottom: 18 },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  primary: { width: '100%', background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 },
  secondary: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, marginTop: 10 },
  tag: { display: 'inline-block', background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: 'var(--text2)', margin: '4px 4px 0 0' }
}

function MediaUploader({ media, setMedia }) {
  const imgRef = useRef()
  const vidRef = useRef()

  const handleFile = (file, type) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setMedia({ file, url, type, name: file.name, size: (file.size / 1024 / 1024).toFixed(1) })
  }

  return (
    <div style={S.field}>
      <label style={S.label}>Ad Creative (Image or Video)</label>

      {!media ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div onClick={() => imgRef.current.click()}
            style={{ border: '1px dashed var(--border2)', borderRadius: 'var(--radius-sm)', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg3)' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>Upload Image</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>JPG, PNG, GIF</div>
            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0], 'image')} />
          </div>

          <div onClick={() => vidRef.current.click()}
            style={{ border: '1px dashed var(--border2)', borderRadius: 'var(--radius-sm)', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg3)' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🎬</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>Upload Video</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>MP4, MOV, AVI</div>
            <input ref={vidRef} type="file" accept="video/*" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0], 'video')} />
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', position: 'relative' }}>
          {media.type === 'image' ? (
            <img src={media.url} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
          ) : (
            <video src={media.url} controls style={{ width: '100%', maxHeight: 180, borderRadius: 6, display: 'block' }} />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{media.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{media.size} MB · {media.type}</div>
            </div>
            <button onClick={() => setMedia(null)}
              style={{ background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewCampaign() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState({ product: '', goal: 'REACH', budget: '500', audience: '', duration: '7' })
  const [media, setMedia] = useState(null)
  const [draft, setDraft] = useState(null)

  const set = (k, v) => setBrief(b => ({ ...b, [k]: v }))

  const generateDraft = async () => {
    setLoading(true)
    try {
      const prompt = `You are a Meta Ads expert. Generate a complete ad campaign draft for:
Product/Service: ${brief.product}
Goal: ${brief.goal}
Daily Budget: ₹${brief.budget}
Target Audience: ${brief.audience}
Duration: ${brief.duration} days
Creative Type: ${media ? media.type : 'not uploaded yet'}

Return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "campaignName": "string",
  "objective": "REACH or CONVERSIONS or TRAFFIC or LEAD_GENERATION",
  "headline": "string (max 40 chars)",
  "primaryText": "string (2-3 sentences, compelling ad copy)",
  "cta": "string (e.g. Shop Now, Learn More, Sign Up)",
  "targeting": {
    "ageMin": number,
    "ageMax": number,
    "interests": ["interest1", "interest2", "interest3"],
    "locations": ["city1", "city2"]
  },
  "estimatedReach": "string (e.g. 15,000 - 45,000 per day)",
  "tips": ["tip1", "tip2", "tip3"]
}`

      let result
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 1800))
        result = getDemoData().draft(brief)
      } else {
        const res = await claudeCall(prompt)
        const clean = res.replace(/```json|```/g, '').trim()
        result = JSON.parse(clean)
      }
      setDraft(result)
      setStep(2)
    } catch (e) {
      alert('Error generating draft: ' + e.message)
    }
    setLoading(false)
  }

  const launch = async () => {
    setLoading(true)
    try {
      if (!isDemo()) {
        await metaCall('createCampaign', {
          name: draft.campaignName,
          objective: draft.objective,
          daily_budget: parseInt(brief.budget) * 100,
          status: 'PAUSED'
        })
      } else {
        await new Promise(r => setTimeout(r, 1200))
        const saved = JSON.parse(localStorage.getItem('demo_campaigns') || '[]')
        saved.push({ id: Date.now(), name: draft.campaignName, status: 'PAUSED', objective: draft.objective, daily_budget: parseInt(brief.budget) * 100, reach: 0, ctr: 0 })
        localStorage.setItem('demo_campaigns', JSON.stringify(saved))
      }
      setStep(3)
    } catch (e) {
      alert('Launch error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={S.wrap}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>⬡ New Campaign</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{steps[step]}</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--border)' }} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <div style={S.card}>
            <div style={S.field}>
              <label style={S.label}>What are you advertising?</label>
              <textarea rows={3} placeholder="e.g. My bakery in Pune — we sell handmade cakes and pastries for birthdays and events" value={brief.product} onChange={e => set('product', e.target.value)} style={{ resize: 'none' }} />
            </div>

            <MediaUploader media={media} setMedia={setMedia} />

            <div style={S.field}>
              <label style={S.label}>Campaign Goal</label>
              <select value={brief.goal} onChange={e => set('goal', e.target.value)}>
                <option value="REACH">Reach — show ad to as many people as possible</option>
                <option value="TRAFFIC">Traffic — get people to visit my website</option>
                <option value="CONVERSIONS">Conversions — get purchases or sign-ups</option>
                <option value="LEAD_GENERATION">Lead Generation — collect contact info</option>
              </select>
            </div>
            <div style={S.row}>
              <div style={S.field}>
                <label style={S.label}>Daily Budget (₹)</label>
                <input type="number" value={brief.budget} onChange={e => set('budget', e.target.value)} placeholder="500" />
              </div>
              <div style={S.field}>
                <label style={S.label}>Duration (days)</label>
                <input type="number" value={brief.duration} onChange={e => set('duration', e.target.value)} placeholder="7" />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Target Audience (optional)</label>
              <input placeholder="e.g. Women 25-45 in Pune interested in baking" value={brief.audience} onChange={e => set('audience', e.target.value)} />
            </div>
          </div>

          <button style={S.primary} onClick={() => { setStep(1); generateDraft() }} disabled={!brief.product || loading}>
            Generate AI Draft →
          </button>
        </div>
      )}

      {step === 1 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⬡</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>AI is crafting your campaign...</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Analyzing audience, writing copy, planning targeting</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {step === 2 && draft && (
        <div>
          {media && (
            <div style={{ ...S.card, padding: '12px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Your Creative</div>
              {media.type === 'image'
                ? <img src={media.url} alt="ad" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6 }} />
                : <video src={media.url} controls style={{ width: '100%', maxHeight: 160, borderRadius: 6 }} />
              }
            </div>
          )}

          <div style={S.card}>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>Campaign Name</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{draft.campaignName}</div>

            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>Ad Headline</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, background: 'var(--bg3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)' }}>{draft.headline}</div>

            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>Ad Copy</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>{draft.primaryText}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>CTA Button</div>
                <div style={{ fontWeight: 700, color: 'var(--blue)' }}>{draft.cta}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>Est. Reach/day</div>
                <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 13 }}>{draft.estimatedReach}</div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>Targeting</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Age: {draft.targeting.ageMin}–{draft.targeting.ageMax}</div>
            <div style={{ marginBottom: 8 }}>{draft.targeting.interests.map(i => <span key={i} style={S.tag}>{i}</span>)}</div>
            <div>{draft.targeting.locations.map(l => <span key={l} style={{ ...S.tag, background: 'rgba(74,158,255,0.08)', borderColor: 'rgba(74,158,255,0.2)', color: 'var(--blue)' }}>{l}</span>)}</div>
          </div>

          <div style={{ ...S.card, border: '1px solid rgba(0,196,140,0.2)', background: 'rgba(0,196,140,0.04)' }}>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>AI Tips</div>
            {draft.tips.map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, paddingLeft: 12, borderLeft: '2px solid var(--green)', lineHeight: 1.5 }}>{t}</div>
            ))}
          </div>

          <button style={S.primary} onClick={launch} disabled={loading}>
            {loading ? 'Launching...' : '🚀 Confirm & Launch Campaign'}
          </button>
          <button style={S.secondary} onClick={() => { setStep(0); setDraft(null) }}>← Regenerate</button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Campaign Created!</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 6 }}><span style={{ color: 'var(--yellow)', fontWeight: 700 }}>Status: PAUSED</span></div>
          <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 32 }}>
            Your campaign is saved in Meta Ads Manager in paused state. Review it there and click Publish when ready.
          </div>
          <button style={S.primary} onClick={() => navigate('/')}>View Dashboard →</button>
        </div>
      )}
    </div>
  )
}
