/**
 * Utility functions for SIP (Systematic Investment Plan) calculations
 */

export interface NAVData {
  date: string;
  nav: number;
}

export interface SIPInput {
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  from: string;
  to: string;
}

export interface SIPResult {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  absoluteReturn: number;
  annualizedReturn: number;
  transactions: SIPTransaction[];
  needsReview: boolean;
}

export interface SIPTransaction {
  date: string;
  amount: number;
  nav: number;
  units: number;
  runningUnits: number;
  value: number;
}

/**
 * Calculate SIP returns based on NAV history
 */
export function calculateSIP(
  navHistory: NAVData[],
  input: SIPInput
): SIPResult {
  // Sort NAV history by date (oldest first)
  const sortedHistory = [...navHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (sortedHistory.length === 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalUnits: 0,
      absoluteReturn: 0,
      annualizedReturn: 0,
      transactions: [],
      needsReview: true
    };
  }

  // Generate SIP dates based on frequency
  const sipDates = generateSIPDates(input.from, input.to, input.frequency);
  
  // Calculate units purchased on each SIP date
  let totalUnits = 0;
  let totalInvested = 0;
  const transactions: SIPTransaction[] = [];
  
  for (const sipDate of sipDates) {
    // Find the NAV on or before the SIP date
    const navEntry = findNearestNAV(sortedHistory, sipDate);
    
    if (!navEntry || navEntry.nav <= 0) {
      continue; // Skip invalid NAVs
    }
    
    const units = input.amount / navEntry.nav;
    totalUnits += units;
    totalInvested += input.amount;
    
    transactions.push({
      date: sipDate,
      amount: input.amount,
      nav: navEntry.nav,
      units,
      runningUnits: totalUnits,
      value: totalUnits * navEntry.nav
    });
  }
  
  // Get the latest NAV for current value calculation
  const latestNAV = sortedHistory[sortedHistory.length - 1].nav;
  const currentValue = totalUnits * latestNAV;
  
  // Calculate returns
  const absoluteReturn = totalInvested > 0 
    ? ((currentValue - totalInvested) / totalInvested) * 100 
    : 0;
  
  // Calculate annualized return (XIRR approximation)
  const firstDate = new Date(input.from);
  const lastDate = new Date(input.to);
  const yearsInvested = (lastDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  const annualizedReturn = yearsInvested >= (30/365.25) // Only if at least 30 days
    ? (Math.pow((currentValue / totalInvested), (1 / yearsInvested)) - 1) * 100
    : 0;
  
  return {
    totalInvested,
    currentValue,
    totalUnits,
    absoluteReturn,
    annualizedReturn,
    transactions,
    needsReview: transactions.length === 0
  };
}

/**
 * Generate SIP dates based on frequency
 */
function generateSIPDates(
  fromDate: string,
  toDate: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
): string[] {
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  const dates: string[] = [];
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    
    // Increment date based on frequency
    switch (frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
    }
  }
  
  return dates;
}

/**
 * Find the NAV entry on or before a given date
 */
function findNearestNAV(navHistory: NAVData[], date: string): NAVData | null {
  const targetDate = new Date(date);
  
  // Find the closest NAV date that is on or before the target date
  let closestEntry: NAVData | null = null;
  let closestDiff = Infinity;
  
  for (const entry of navHistory) {
    const entryDate = new Date(entry.date);
    const diff = targetDate.getTime() - entryDate.getTime();
    
    // Only consider dates on or before the target date
    if (diff >= 0 && diff < closestDiff) {
      closestDiff = diff;
      closestEntry = entry;
    }
  }
  
  return closestEntry;
}

/**
 * Calculate returns for a specific period
 */
export function calculateReturns(
  navHistory: NAVData[],
  period: '1m' | '3m' | '6m' | '1y' | string,
  customFrom?: string,
  customTo?: string
) {
  // Sort NAV history by date (oldest first)
  const sortedHistory = [...navHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (sortedHistory.length === 0) {
    return {
      startDate: null,
      endDate: null,
      startNAV: 0,
      endNAV: 0,
      simpleReturn: 0,
      annualizedReturn: 0
    };
  }
  
  // Determine start and end dates based on period
  let startDate: Date;
  const endDate = customTo 
    ? new Date(customTo) 
    : new Date(sortedHistory[sortedHistory.length - 1].date);
  
  if (customFrom && customTo) {
    startDate = new Date(customFrom);
  } else {
    switch (period) {
      case '1m':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3m':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6m':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(sortedHistory[0].date);
    }
  }
  
  // Find NAVs closest to start and end dates
  const startNAVEntry = findNearestNAV(sortedHistory, startDate.toISOString().split('T')[0]);
  const endNAVEntry = findNearestNAV(sortedHistory, endDate.toISOString().split('T')[0]);
  
  if (!startNAVEntry || !endNAVEntry) {
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      startNAV: 0,
      endNAV: 0,
      simpleReturn: 0,
      annualizedReturn: 0
    };
  }
  
  const startNAV = startNAVEntry.nav;
  const endNAV = endNAVEntry.nav;
  
  // Calculate simple return
  const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;
  
  // Calculate annualized return (only if duration ≥ 30 days)
  const durationDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  const annualizedReturn = durationDays >= 30
    ? (Math.pow((endNAV / startNAV), (365.25 / durationDays)) - 1) * 100
    : 0;
  
  return {
    startDate: startNAVEntry.date,
    endDate: endNAVEntry.date,
    startNAV,
    endNAV,
    simpleReturn,
    annualizedReturn
  };
}

/**
 * Calculate lumpsum investment returns
 */
export function calculateLumpsum(
  navHistory: NAVData[],
  amount: number,
  fromDate: string,
  toDate?: string
) {
  // Sort NAV history by date (oldest first)
  const sortedHistory = [...navHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (sortedHistory.length === 0) {
    return {
      investmentDate: fromDate,
      currentDate: toDate || new Date().toISOString().split('T')[0],
      investmentAmount: amount,
      investmentNAV: 0,
      currentNAV: 0,
      units: 0,
      currentValue: 0,
      absoluteReturn: 0,
      annualizedReturn: 0
    };
  }
  
  // Find NAV on investment date
  const startDate = new Date(fromDate);
  const endDate = toDate 
    ? new Date(toDate) 
    : new Date(sortedHistory[sortedHistory.length - 1].date);
  
  const investmentNAVEntry = findNearestNAV(sortedHistory, fromDate);
  const currentNAVEntry = findNearestNAV(
    sortedHistory, 
    toDate || sortedHistory[sortedHistory.length - 1].date
  );
  
  if (!investmentNAVEntry || !currentNAVEntry) {
    return {
      investmentDate: fromDate,
      currentDate: toDate || new Date().toISOString().split('T')[0],
      investmentAmount: amount,
      investmentNAV: 0,
      currentNAV: 0,
      units: 0,
      currentValue: 0,
      absoluteReturn: 0,
      annualizedReturn: 0
    };
  }
  
  const investmentNAV = investmentNAVEntry.nav;
  const currentNAV = currentNAVEntry.nav;
  
  // Calculate units purchased
  const units = amount / investmentNAV;
  
  // Calculate current value
  const currentValue = units * currentNAV;
  
  // Calculate returns
  const absoluteReturn = ((currentValue - amount) / amount) * 100;
  
  // Calculate annualized return
  const durationDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  const annualizedReturn = durationDays >= 30
    ? (Math.pow((currentValue / amount), (365.25 / durationDays)) - 1) * 100
    : 0;
  
  return {
    investmentDate: investmentNAVEntry.date,
    currentDate: currentNAVEntry.date,
    investmentAmount: amount,
    investmentNAV,
    currentNAV,
    units,
    currentValue,
    absoluteReturn,
    annualizedReturn
  };
}

/**
 * Calculate Systematic Withdrawal Plan (SWP)
 */
export function calculateSWP(
  navHistory: NAVData[],
  initialInvestment: number,
  withdrawalAmount: number,
  frequency: 'monthly' | 'quarterly',
  fromDate: string,
  toDate: string
) {
  // Sort NAV history by date (oldest first)
  const sortedHistory = [...navHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (sortedHistory.length === 0) {
    return {
      initialInvestment,
      totalWithdrawn: 0,
      remainingValue: 0,
      remainingUnits: 0,
      transactions: [],
      needsReview: true
    };
  }
  
  // Find initial NAV
  const initialNAVEntry = findNearestNAV(sortedHistory, fromDate);
  
  if (!initialNAVEntry || initialNAVEntry.nav <= 0) {
    return {
      initialInvestment,
      totalWithdrawn: 0,
      remainingValue: 0,
      remainingUnits: 0,
      transactions: [],
      needsReview: true
    };
  }
  
  // Calculate initial units
  let remainingUnits = initialInvestment / initialNAVEntry.nav;
  
  // Generate withdrawal dates
  const withdrawalDates = generateSIPDates(fromDate, toDate, frequency);
  
  // Process each withdrawal
  let totalWithdrawn = 0;
  const transactions = [];
  
  for (const date of withdrawalDates) {
    const navEntry = findNearestNAV(sortedHistory, date);
    
    if (!navEntry || navEntry.nav <= 0) {
      continue;
    }
    
    // Calculate units to withdraw
    const unitsToWithdraw = withdrawalAmount / navEntry.nav;
    
    // Check if we have enough units
    if (unitsToWithdraw > remainingUnits) {
      // Not enough units, withdraw whatever is left
      const actualWithdrawal = remainingUnits * navEntry.nav;
      totalWithdrawn += actualWithdrawal;
      
      transactions.push({
        date,
        withdrawalAmount: actualWithdrawal,
        nav: navEntry.nav,
        unitsWithdrawn: remainingUnits,
        remainingUnits: 0,
        remainingValue: 0
      });
      
      remainingUnits = 0;
      break;
    }
    
    // Process normal withdrawal
    remainingUnits -= unitsToWithdraw;
    totalWithdrawn += withdrawalAmount;
    
    transactions.push({
      date,
      withdrawalAmount,
      nav: navEntry.nav,
      unitsWithdrawn: unitsToWithdraw,
      remainingUnits,
      remainingValue: remainingUnits * navEntry.nav
    });
  }
  
  // Calculate remaining value using latest NAV
  const latestNAV = sortedHistory[sortedHistory.length - 1].nav;
  const remainingValue = remainingUnits * latestNAV;
  
  return {
    initialInvestment,
    totalWithdrawn,
    remainingValue,
    remainingUnits,
    transactions,
    needsReview: transactions.length === 0
  };
}