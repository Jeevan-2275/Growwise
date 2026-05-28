export type MockFund = {
  schemeCode: string
  schemeName: string
  category: string
  fundHouse: string
  schemeType: string
  schemeCategory: string
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

const fundHouses = [
  'HDFC Mutual Fund', 'SBI Mutual Fund', 'ICICI Prudential', 'Axis Mutual Fund',
  'Kotak Mahindra', 'Aditya Birla Sun Life', 'Franklin Templeton', 'UTI Mutual Fund'
]

const bases = [
  { name: 'Bluechip Equity Fund', cat: 'Equity Large Cap', type: 'Open Ended' },
  { name: 'Flexi Cap Opportunities', cat: 'Flexi Cap', type: 'Open Ended' },
  { name: 'Midcap Growth Fund', cat: 'Equity Mid Cap', type: 'Open Ended' },
  { name: 'Smallcap Leaders', cat: 'Equity Small Cap', type: 'Open Ended' },
  { name: 'Nifty 50 Index', cat: 'Index', type: 'Open Ended' },
  { name: 'Banking & PSU Debt', cat: 'Debt', type: 'Open Ended' },
  { name: 'Dynamic Asset Allocation', cat: 'Hybrid', type: 'Open Ended' },
  { name: 'Gold ETF', cat: 'Commodity', type: 'Open Ended' },
]

export const mockFunds: MockFund[] = Array.from({ length: 100 }).map((_, i) => {
  const base = bases[i % bases.length]
  const fundHouse = fundHouses[i % fundHouses.length]
  const code = String(100000 + i)
  const start = 10 + (i % 10)
  const history = genHistory(start)
  const latestNav = history[history.length - 1].nav
  const rating = 3 + (i % 3)
  return {
    schemeCode: code,
    schemeName: `${fundHouse.split(' ')[0]} ${base.name} ${i + 1}`,
    category: base.cat,
    fundHouse,
    schemeType: base.type,
    schemeCategory: base.cat,
    rating,
    latestNav,
    returns: { oneY: 12 + (i % 5), threeY: 14 + (i % 4), fiveY: 16 + (i % 3) },
    history,
  }
})

