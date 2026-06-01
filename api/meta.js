export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const TOKEN = process.env.META_ACCESS_TOKEN
  const AD_ACCOUNT = process.env.META_AD_ACCOUNT_ID
  const BASE = 'https://graph.facebook.com/v19.0'

  try {
    const { action, payload } = req.body || {}

    if (action === 'getCampaigns') {
      const r = await fetch(
        `${BASE}/${AD_ACCOUNT}/campaigns?fields=id,name,status,objective,daily_budget,spend_cap&access_token=${TOKEN}`
      )
      const d = await r.json()
      return res.status(200).json(d)
    }

    if (action === 'getInsights') {
      const { campaignId } = payload
      const r = await fetch(
        `${BASE}/${campaignId}/insights?fields=reach,impressions,clicks,ctr,cpm,spend,actions&date_preset=last_7d&access_token=${TOKEN}`
      )
      const d = await r.json()
      return res.status(200).json(d)
    }

    if (action === 'createCampaign') {
      const { name, objective, daily_budget, status } = payload
      const r = await fetch(`${BASE}/${AD_ACCOUNT}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          objective: objective || 'REACH',
          daily_budget: daily_budget || 500,
          status: status || 'PAUSED',
          access_token: TOKEN
        })
      })
      const d = await r.json()
      return res.status(200).json(d)
    }

    if (action === 'updateCampaignStatus') {
      const { campaignId, status } = payload
      const r = await fetch(`${BASE}/${campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, access_token: TOKEN })
      })
      const d = await r.json()
      return res.status(200).json(d)
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
