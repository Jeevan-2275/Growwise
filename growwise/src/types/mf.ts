export interface MutualFund {
  schemeCode: string
  schemeName: string
  fundHouse: string
  schemeType: string
  schemeCategory: string
  nav: number
  date: string
  returns?: {
    oneYear: number
    threeYear: number
    fiveYear: number
  }
}

export interface MFNAV {
  date: string
  nav: number
}

export interface MFSearchResult {
  schemeCode: string
  schemeName: string
  fundHouse: string
  schemeType: string
  schemeCategory: string
  nav: number
  date: string
}

export interface MFDetails extends MutualFund {
  returns: {
    oneYear: number
    threeYear: number
    fiveYear: number
  }
}

export interface FundWithNAV extends MFDetails {
  navHistory: MFNAV[]
}

export interface MFPerformance {
  schemeCode: string
  schemeName: string
  returns: {
    oneDay: number
    oneWeek: number
    oneMonth: number
    threeMonths: number
    sixMonths: number
    oneYear: number
    threeYear: number
    fiveYear: number
    sinceInception: number
  }
  riskMetrics: {
    volatility: number
    sharpeRatio: number
    beta: number
    alpha: number
  }
}

export interface MFComparison {
  funds: MutualFund[]
  comparison: {
    bestPerformer: string
    lowestRisk: string
    highestReturn: string
    mostConsistent: string
  }
}

export interface MFSearchFilters {
  fundHouse?: string
  schemeType?: string
  schemeCategory?: string
  minNav?: number
  maxNav?: number
  minOneYearReturn?: number
  maxOneYearReturn?: number
}

export interface MFSearchParams {
  query?: string
  filters?: MFSearchFilters
  sortBy?: 'nav' | 'oneYearReturn' | 'threeYearReturn' | 'fiveYearReturn' | 'name'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
