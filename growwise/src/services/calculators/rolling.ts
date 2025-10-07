export interface RollingReturnData {
  date: string
  nav: number
  returns: {
    oneYear: number | null
    threeYear: number | null
    fiveYear: number | null
  }
}

export interface RollingReturnResult {
  schemeCode: string
  schemeName: string
  data: RollingReturnData[]
  summary: {
    averageOneYear: number
    averageThreeYear: number
    averageFiveYear: number
    volatility: number
    sharpeRatio: number
  }
}

export function calculateRollingReturns(
  navData: { date: string; nav: number }[],
  schemeCode: string,
  schemeName: string
): RollingReturnResult {
  const sortedData = navData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const result: RollingReturnData[] = []
  
  for (let i = 0; i < sortedData.length; i++) {
    const current = sortedData[i]
    const oneYearAgo = new Date(current.date)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const threeYearAgo = new Date(current.date)
    threeYearAgo.setFullYear(threeYearAgo.getFullYear() - 3)
    
    const fiveYearAgo = new Date(current.date)
    fiveYearAgo.setFullYear(fiveYearAgo.getFullYear() - 5)
    
    const oneYearData = sortedData.find(d => new Date(d.date) <= oneYearAgo)
    const threeYearData = sortedData.find(d => new Date(d.date) <= threeYearAgo)
    const fiveYearData = sortedData.find(d => new Date(d.date) <= fiveYearAgo)
    
    const oneYearReturn = oneYearData ? ((current.nav - oneYearData.nav) / oneYearData.nav) * 100 : null
    const threeYearReturn = threeYearData ? ((current.nav - threeYearData.nav) / threeYearData.nav) * 100 : null
    const fiveYearReturn = fiveYearData ? ((current.nav - fiveYearData.nav) / fiveYearData.nav) * 100 : null
    
    result.push({
      date: current.date,
      nav: current.nav,
      returns: {
        oneYear: oneYearReturn,
        threeYear: threeYearReturn,
        fiveYear: fiveYearReturn
      }
    })
  }
  
  // Calculate summary statistics
  const oneYearReturns = result.map(r => r.returns.oneYear).filter(r => r !== null) as number[]
  const threeYearReturns = result.map(r => r.returns.threeYear).filter(r => r !== null) as number[]
  const fiveYearReturns = result.map(r => r.returns.fiveYear).filter(r => r !== null) as number[]
  
  const averageOneYear = oneYearReturns.length > 0 ? oneYearReturns.reduce((a, b) => a + b, 0) / oneYearReturns.length : 0
  const averageThreeYear = threeYearReturns.length > 0 ? threeYearReturns.reduce((a, b) => a + b, 0) / threeYearReturns.length : 0
  const averageFiveYear = fiveYearReturns.length > 0 ? fiveYearReturns.reduce((a, b) => a + b, 0) / fiveYearReturns.length : 0
  
  // Calculate volatility (standard deviation)
  const volatility = calculateVolatility(oneYearReturns)
  
  // Calculate Sharpe ratio (assuming risk-free rate of 6%)
  const riskFreeRate = 6
  const sharpeRatio = volatility > 0 ? (averageOneYear - riskFreeRate) / volatility : 0
  
  return {
    schemeCode,
    schemeName,
    data: result,
    summary: {
      averageOneYear,
      averageThreeYear,
      averageFiveYear,
      volatility,
      sharpeRatio
    }
  }
}

function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, return_) => sum + Math.pow(return_ - mean, 2), 0) / returns.length
  return Math.sqrt(variance)
}
