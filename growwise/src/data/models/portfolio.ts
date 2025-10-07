export interface Portfolio {
  id: string
  userId: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  holdings: Holding[]
}

export interface Holding {
  id: string
  portfolioId: string
  schemeCode: string
  schemeName: string
  units: number
  averagePrice: number
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioSummary {
  totalValue: number
  totalInvestment: number
  totalReturns: number
  absoluteReturns: number
  holdings: (Holding & {
    currentValue: number
    currentPrice: number
    returns: number
    returnsPercentage: number
  })[]
}

export interface PortfolioPerformance {
  oneDay: number
  oneWeek: number
  oneMonth: number
  threeMonths: number
  sixMonths: number
  oneYear: number
  sinceInception: number
}

export interface AssetAllocation {
  equity: number
  debt: number
  hybrid: number
  others: number
}

export interface SectorAllocation {
  sector: string
  percentage: number
  value: number
}

export interface PortfolioAnalytics {
  summary: PortfolioSummary
  performance: PortfolioPerformance
  assetAllocation: AssetAllocation
  sectorAllocation: SectorAllocation[]
  topPerformers: (Holding & {
    currentValue: number
    returns: number
    returnsPercentage: number
  })[]
  bottomPerformers: (Holding & {
    currentValue: number
    returns: number
    returnsPercentage: number
  })[]
}
