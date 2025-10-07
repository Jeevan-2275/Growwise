// Mock MF helpers (no network)
export interface MFSearchResult { schemeCode: string; schemeName: string; category: string; rating: number; latestNav: number; returns: { oneY: number; threeY: number; fiveY: number } }
export interface MFNAV { date: string; nav: number }
export interface MFDetails extends MFSearchResult { house?: string; history: MFNAV[] }

import { mockFunds } from '@/data/mock/funds'

export async function searchMFs(query: string): Promise<MFSearchResult[]> {
  const q = query.toLowerCase()
  return mockFunds.filter(f => f.schemeName.toLowerCase().includes(q) || f.schemeCode.includes(query)).slice(0, 40)
}

export async function getMFDetails(schemeCode: string): Promise<MFDetails> {
  const fund = mockFunds.find(f => f.schemeCode === schemeCode)
  if (!fund) throw new Error('Not found')
  return fund
}

export async function getMFNAV(schemeCode: string): Promise<MFNAV[]> {
  const fund = mockFunds.find(f => f.schemeCode === schemeCode)
  if (!fund) return []
  return fund.history
}
