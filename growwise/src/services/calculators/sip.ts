export interface SIPCalculationResult {
  totalInvestment: number
  totalReturns: number
  totalValue: number
  absoluteReturns: number
  annualizedReturns: number
  monthlyData: {
    month: number
    investment: number
    value: number
    returns: number
  }[]
}

export function calculateSIP(
  monthlyAmount: number,
  investmentPeriod: number, // in months
  expectedReturn: number // annual percentage
): SIPCalculationResult {
  const monthlyReturn = expectedReturn / 100 / 12
  const totalInvestment = monthlyAmount * investmentPeriod
  
  let totalValue = 0
  const monthlyData = []
  
  for (let month = 1; month <= investmentPeriod; month++) {
    const investment = monthlyAmount
    const futureValue = investment * Math.pow(1 + monthlyReturn, investmentPeriod - month + 1)
    totalValue += futureValue
    
    monthlyData.push({
      month,
      investment,
      value: futureValue,
      returns: futureValue - investment
    })
  }
  
  const totalReturns = totalValue - totalInvestment
  const absoluteReturns = (totalReturns / totalInvestment) * 100
  const annualizedReturns = Math.pow(totalValue / totalInvestment, 12 / investmentPeriod) - 1
  
  return {
    totalInvestment,
    totalReturns,
    totalValue,
    absoluteReturns,
    annualizedReturns: annualizedReturns * 100,
    monthlyData
  }
}

export function calculateSIPWithInflation(
  monthlyAmount: number,
  investmentPeriod: number,
  expectedReturn: number,
  inflationRate: number = 6
): SIPCalculationResult {
  const realReturn = ((1 + expectedReturn / 100) / (1 + inflationRate / 100)) - 1
  return calculateSIP(monthlyAmount, investmentPeriod, realReturn * 100)
}
