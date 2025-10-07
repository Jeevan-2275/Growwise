export interface SWPCalculationResult {
  corpus: number
  monthlyWithdrawal: number
  totalWithdrawals: number
  remainingCorpus: number
  monthlyData: {
    month: number
    beginningValue: number
    withdrawal: number
    endingValue: number
    returns: number
  }[]
}

export function calculateSWP(
  corpus: number,
  monthlyWithdrawal: number,
  expectedReturn: number, // annual percentage
  maxPeriod: number = 300 // maximum months to calculate
): SWPCalculationResult {
  const monthlyReturn = expectedReturn / 100 / 12
  let currentValue = corpus
  const monthlyData = []
  let totalWithdrawals = 0
  
  for (let month = 1; month <= maxPeriod && currentValue > 0; month++) {
    const beginningValue = currentValue
    const growth = currentValue * monthlyReturn
    const afterGrowth = currentValue + growth
    
    const withdrawal = Math.min(monthlyWithdrawal, afterGrowth)
    const endingValue = afterGrowth - withdrawal
    
    totalWithdrawals += withdrawal
    currentValue = endingValue
    
    monthlyData.push({
      month,
      beginningValue,
      withdrawal,
      endingValue,
      returns: growth
    })
    
    if (endingValue <= 0) break
  }
  
  return {
    corpus,
    monthlyWithdrawal,
    totalWithdrawals,
    remainingCorpus: currentValue,
    monthlyData
  }
}

export function calculateSWPDuration(
  corpus: number,
  monthlyWithdrawal: number,
  expectedReturn: number
): number {
  const monthlyReturn = expectedReturn / 100 / 12
  let currentValue = corpus
  let months = 0
  
  while (currentValue > 0 && months < 300) {
    const growth = currentValue * monthlyReturn
    const afterGrowth = currentValue + growth
    const withdrawal = Math.min(monthlyWithdrawal, afterGrowth)
    currentValue = afterGrowth - withdrawal
    months++
  }
  
  return months
}
