export interface LumpsumCalculationResult {
  principal: number
  totalValue: number
  totalReturns: number
  absoluteReturns: number
  annualizedReturns: number
  yearlyData: {
    year: number
    value: number
    returns: number
  }[]
}

export function calculateLumpsum(
  amount: number,
  investmentPeriod: number, // in years
  expectedReturn: number // annual percentage
): LumpsumCalculationResult {
  const totalValue = amount * Math.pow(1 + expectedReturn / 100, investmentPeriod)
  const totalReturns = totalValue - amount
  const absoluteReturns = (totalReturns / amount) * 100
  const annualizedReturns = expectedReturn
  
  const yearlyData = []
  for (let year = 1; year <= investmentPeriod; year++) {
    const value = amount * Math.pow(1 + expectedReturn / 100, year)
    const returns = value - amount
    
    yearlyData.push({
      year,
      value,
      returns
    })
  }
  
  return {
    principal: amount,
    totalValue,
    totalReturns,
    absoluteReturns,
    annualizedReturns,
    yearlyData
  }
}

export function calculateLumpsumWithInflation(
  amount: number,
  investmentPeriod: number,
  expectedReturn: number,
  inflationRate: number = 6
): LumpsumCalculationResult {
  const realReturn = ((1 + expectedReturn / 100) / (1 + inflationRate / 100)) - 1
  return calculateLumpsum(amount, investmentPeriod, realReturn * 100)
}
