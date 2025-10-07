export type MockFund = {
  schemeCode: string
  schemeName: string
  category: string
  rating: number
  latestNav: number
  returns: { oneY: number; threeY: number; fiveY: number }
  history: { date: string; nav: number }[]
}

function genHistory(startNav: number, days = 365 * 3): { date: string; nav: number }[] {
  const out: { date: string; nav: number }[] = []
  let nav = startNav
  const today = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    // small random walk
    const drift = (Math.random() - 0.5) * 0.2
    nav = Math.max(5, nav + drift)
    out.push({ date: d.toISOString().slice(0, 10), nav: Number(nav.toFixed(2)) })
  }
  return out
}

const bases = [
  { name: 'Bluechip Equity Fund', cat: 'Equity Large Cap' },
  { name: 'Flexi Cap Opportunities', cat: 'Flexi Cap' },
  { name: 'Midcap Growth Fund', cat: 'Equity Mid Cap' },
  { name: 'Smallcap Leaders', cat: 'Equity Small Cap' },
  { name: 'Nifty 50 Index', cat: 'Index' },
  { name: 'Banking & PSU Debt', cat: 'Debt' },
  { name: 'Dynamic Asset Allocation', cat: 'Hybrid' },
  { name: 'Gold ETF', cat: 'Commodity' },
]

export const mockFunds: MockFund[] = Array.from({ length: 32 }).map((_, i) => {
  const base = bases[i % bases.length]
  const code = String(100000 + i)
  const start = 10 + (i % 10)
  const history = genHistory(start)
  const latestNav = history[history.length - 1].nav
  const rating = 3 + (i % 3)
  return {
    schemeCode: code,
    schemeName: `GW ${base.name} ${i + 1}`,
    category: base.cat,
    rating,
    latestNav,
    returns: { oneY: 12 + (i % 5), threeY: 14 + (i % 4), fiveY: 16 + (i % 3) },
    history,
  }
})

