import { MFNAV } from '@/lib/mf';
import { logger } from '@/lib/logger';

export interface CalculatorResult {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  absoluteReturn: number;
  annualizedReturn: number;
  breakdown: Array<{
    date: string;
    nav: number;
    amount: number;
    units: number;
    cumulativeUnits: number;
    cumulativeInvested: number;
    cumulativeValue: number;
  }>;
  chartData: Array<{
    date: string;
    invested: number;
    value: number;
    nav: number;
  }>;
}

/**
 * Calculate SIP (Systematic Investment Plan) results
 */
export function calculateSIP(
  navHistory: MFNAV[],
  amount: number,
  frequency: string = 'monthly',
  startDate: string,
  endDate: string = new Date().toISOString().split('T')[0]
): CalculatorResult {
  try {
    // Sort NAV history by date (oldest to newest)
    const sortedNavHistory = [...navHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter NAV history to include only dates within the specified range
    const filteredNavHistory = sortedNavHistory.filter(
      item => item.date >= startDate && item.date <= endDate
    );

    if (filteredNavHistory.length === 0) {
      throw new Error('No NAV data available for the specified date range');
    }

    // Determine investment dates based on frequency
    let investmentDates: string[];
    if (frequency === 'monthly') {
      investmentDates = generateMonthlyDates(startDate, endDate);
    } else if (frequency === 'quarterly') {
      // Generate quarterly dates
      investmentDates = generateQuarterlyDates(startDate, endDate);
    } else if (frequency === 'yearly') {
      // Generate yearly dates
      investmentDates = generateYearlyDates(startDate, endDate);
    } else {
      // Default to monthly
      investmentDates = generateMonthlyDates(startDate, endDate);
    }
    
    // Calculate SIP results
    const breakdown: any[] = [];
    let totalUnits = 0;
    let totalInvested = 0;

    investmentDates.forEach(investmentDate => {
      // Find the closest NAV date
      const closestNavData = findClosestNavData(filteredNavHistory, investmentDate);
      
      if (!closestNavData) return;
      
      const { date, nav } = closestNavData;
      const units = amount / nav;
      
      totalUnits += units;
      totalInvested += amount;
      
      breakdown.push({
        date,
        nav,
        amount: amount,
        units,
        cumulativeUnits: totalUnits,
        cumulativeInvested: totalInvested,
        cumulativeValue: totalUnits * nav
      });
    });

    // Calculate final values
    const latestNAV = filteredNavHistory[filteredNavHistory.length - 1].nav;
    const currentValue = totalUnits * latestNAV;
    const absoluteReturn = currentValue - totalInvested;
    const annualizedReturn = calculateAnnualizedReturn(
      currentValue,
      totalInvested,
      investmentDates.length / 12
    );

    // Generate chart data
    const chartData = breakdown.map(item => ({
      date: item.date,
      invested: item.cumulativeInvested,
      value: item.cumulativeValue,
      nav: item.nav
    }));

    return {
      totalInvested,
      currentValue,
      totalUnits,
      absoluteReturn,
      annualizedReturn,
      breakdown,
      chartData
    };
  } catch (error) {
    logger.error('Error calculating SIP', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw new Error('Failed to calculate SIP results');
  }
}

/**
 * Generate quarterly dates between start and end dates
 */
function generateQuarterlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  // Set to the same day of month as the start date
  const dayOfMonth = currentDate.getDate();

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    
    // Move to next quarter (3 months)
    currentDate.setMonth(currentDate.getMonth() + 3);
    
    // Adjust for months with fewer days
    if (currentDate.getDate() !== dayOfMonth) {
      currentDate.setDate(0); // Last day of previous month
    }
  }

  return dates;
}

/**
 * Generate yearly dates between start and end dates
 */
function generateYearlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  // Set to the same day of month as the start date
  const dayOfMonth = currentDate.getDate();
  const monthOfYear = currentDate.getMonth();

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    
    // Move to next year
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    
    // Ensure we maintain the same month and adjust for leap years
    currentDate.setMonth(monthOfYear);
    
    // Adjust for months with fewer days
    if (currentDate.getDate() !== dayOfMonth) {
      currentDate.setDate(0); // Last day of previous month
    }
  }

  return dates;
}

/**
 * Calculate Lumpsum investment results
 */
export function calculateLumpsum(
  navHistory: MFNAV[],
  amount: number,
  investmentDate: string,
  redemptionDate: string = new Date().toISOString().split('T')[0]
): CalculatorResult {
  try {
    // Sort NAV history by date (oldest to newest)
    const sortedNavHistory = [...navHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter NAV history to include only dates within the specified range
    const filteredNavHistory = sortedNavHistory.filter(
      item => item.date >= investmentDate && item.date <= redemptionDate
    );

    if (filteredNavHistory.length === 0) {
      throw new Error('No NAV data available for the specified date range');
    }

    // Find investment NAV
    const investmentNavData = findClosestNavData(filteredNavHistory, investmentDate);
    
    if (!investmentNavData) {
      throw new Error('No NAV data available for the investment date');
    }

    const { nav: investmentNAV } = investmentNavData;
    const units = amount / investmentNAV;
    
    // Calculate values over time
    const breakdown = filteredNavHistory.map(({ date, nav }) => {
      const value = units * nav;
      
      return {
        date,
        nav,
        amount: 0, // Only initial investment, no recurring
        units: 0, // Units purchased on this date (0 after initial)
        cumulativeUnits: units,
        cumulativeInvested: amount,
        cumulativeValue: value
      };
    });

    // Set the initial investment in the first entry
    if (breakdown.length > 0) {
      breakdown[0].amount = amount;
      breakdown[0].units = units;
    }

    // Calculate final values
    const latestNAV = filteredNavHistory[filteredNavHistory.length - 1].nav;
    const currentValue = units * latestNAV;
    const absoluteReturn = currentValue - amount;
    
    // Calculate years between investment and redemption
    const investmentDateObj = new Date(investmentDate);
    const redemptionDateObj = new Date(redemptionDate);
    const yearsDiff = (redemptionDateObj.getTime() - investmentDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    const annualizedReturn = calculateAnnualizedReturn(
      currentValue,
      amount,
      yearsDiff
    );

    // Generate chart data
    const chartData = breakdown.map(item => ({
      date: item.date,
      invested: item.cumulativeInvested,
      value: item.cumulativeValue,
      nav: item.nav
    }));

    return {
      totalInvested: amount,
      currentValue,
      totalUnits: units,
      absoluteReturn,
      annualizedReturn,
      breakdown,
      chartData
    };
  } catch (error) {
    logger.error('Error calculating Lumpsum investment', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw new Error('Failed to calculate Lumpsum investment results');
  }
}

/**
 * Generate monthly dates between start and end dates
 */
function generateMonthlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  // Set to the same day of month as the start date
  const dayOfMonth = currentDate.getDate();

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    // Adjust for months with fewer days
    if (currentDate.getDate() !== dayOfMonth) {
      currentDate.setDate(0); // Last day of previous month
    }
  }

  return dates;
}

/**
 * Find the closest NAV data for a given date
 */
function findClosestNavData(navHistory: MFNAV[], targetDate: string): MFNAV | null {
  if (navHistory.length === 0) return null;

  const targetTime = new Date(targetDate).getTime();
  
  let closestEntry = navHistory[0];
  let minDiff = Math.abs(new Date(closestEntry.date).getTime() - targetTime);

  for (const entry of navHistory) {
    const diff = Math.abs(new Date(entry.date).getTime() - targetTime);
    
    if (diff < minDiff) {
      minDiff = diff;
      closestEntry = entry;
    }
  }

  return closestEntry;
}

/**
 * Calculate annualized return
 */
function calculateAnnualizedReturn(finalValue: number, initialValue: number, years: number): number {
  if (years <= 0 || initialValue <= 0) return 0;
  
  // (Final Value / Initial Value)^(1/years) - 1
  const annualizedReturn = Math.pow(finalValue / initialValue, 1 / years) - 1;
  
  return annualizedReturn * 100; // Convert to percentage
}