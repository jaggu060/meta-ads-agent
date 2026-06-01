export async function claudeCall(prompt) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Claude API error')
  return data.content
}

export async function metaCall(action, payload) {
  const res = await fetch('/api/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Meta API error')
  return data
}

export function getDemoData() {
  return {
    campaigns: [
      { id: '1001', name: 'Summer Sale — Pune Bakery', status: 'ACTIVE', objective: 'REACH', daily_budget: 50000, reach: 34200, ctr: 2.4, cpm: 38, spend: 350 },
      { id: '1002', name: 'Grand Opening Offer', status: 'ACTIVE', objective: 'TRAFFIC', daily_budget: 30000, reach: 18700, ctr: 1.9, cpm: 52, spend: 210 },
      { id: '1003', name: 'Weekend Special Cakes', status: 'PAUSED', objective: 'CONVERSIONS', daily_budget: 20000, reach: 9400, ctr: 0.8, cpm: 71, spend: 140 },
    ],

    draft: (brief) => ({
      campaignName: `${brief.product.split(' ').slice(0, 4).join(' ')} — ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
      objective: brief.goal,
      headline: `Best Deals on ${brief.product.split(' ').slice(0, 3).join(' ')}`,
      primaryText: `Looking for the best ${brief.product.split(' ').slice(0, 3).join(' ')}? We've got you covered. Premium quality, unbeatable prices. Limited time offer — don't miss out!`,
      cta: brief.goal === 'LEAD_GENERATION' ? 'Sign Up' : brief.goal === 'TRAFFIC' ? 'Learn More' : 'Shop Now',
      targeting: {
        ageMin: 22, ageMax: 45,
        interests: ['Online Shopping', 'Local Businesses', 'Deals & Offers'],
        locations: ['Pune', 'Mumbai', 'Nashik']
      },
      estimatedReach: `${Math.floor(parseInt(brief.budget) * 28).toLocaleString()} – ${Math.floor(parseInt(brief.budget) * 52).toLocaleString()} per day`,
      tips: [
        'Use a bright, high-quality product image to increase CTR by up to 40%',
        `A ₹${brief.budget}/day budget in Pune typically yields strong reach in the 25-40 age bracket`,
        'Run the campaign on Thursday–Sunday for 15–20% better engagement'
      ]
    }),

    evaluation: (campaign) => {
      const reach = campaign.reach || 28000
      const ctr = parseFloat(campaign.ctr || 1.8)
      const reachScore = Math.min(100, Math.floor(reach / 400))
      const ctrScore = Math.min(100, Math.floor(ctr * 30))
      const efficiencyScore = Math.floor((reachScore + ctrScore) / 2)
      const overallScore = Math.floor((reachScore * 0.4 + ctrScore * 0.35 + efficiencyScore * 0.25))
      const grade = overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 55 ? 'C' : overallScore >= 40 ? 'D' : 'F'
      const recommendation = overallScore >= 65 ? 'SCALE' : overallScore >= 40 ? 'OPTIMIZE' : 'PAUSE'
      return {
        reachScore, ctrScore, efficiencyScore, overallScore, grade,
        summary: `This campaign is performing ${overallScore >= 65 ? 'above' : overallScore >= 40 ? 'at' : 'below'} average for its objective. ${overallScore >= 65 ? 'The reach and engagement metrics are healthy.' : 'There is room for optimization in targeting and creative.'}`,
        strengths: [
          reach > 20000 ? 'Strong reach numbers for the budget' : 'Consistent delivery across the week',
          ctr > 1.5 ? 'Above-average click-through rate' : 'Steady impression delivery'
        ],
        improvements: [
          'Test a second ad creative with a different headline',
          ctr < 1.5 ? 'CTR is below 1.5% — try a stronger call-to-action' : 'Expand to lookalike audiences',
          'Add a retargeting ad set for people who clicked but didn\'t convert'
        ],
        recommendation,
        recommendationReason: recommendation === 'SCALE' ? 'Metrics are strong. Increasing daily budget by 20–30% should yield proportional reach gains.' : recommendation === 'OPTIMIZE' ? 'Performance is moderate. Test a new creative and tighten the audience targeting before scaling.' : 'CTR and reach are underperforming. Pause and redesign the creative and targeting strategy.'
      }
    }
  }
}
