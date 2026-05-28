import { MFDetails, MFNAV, MFSearchResult } from '@/lib/mf';
import { logger } from '@/lib/logger';

// API endpoint for mutual fund data
const MF_API_BASE_URL = 'https://api.mfapi.in';

/**
 * Fetch real mutual fund data by scheme code
 */
export async function fetchRealFundDetails(schemeCode: string): Promise<MFDetails> {
  try {
    const response = await fetch(`${MF_API_BASE_URL}/mf/schemes/${schemeCode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch fund details: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform API response to match our application's data structure
    return {
      schemeCode: schemeCode,
      schemeName: data.meta.scheme_name || '',
      category: data.meta.scheme_category || '',
      fundHouse: data.meta.fund_house || '',
      schemeType: data.meta.scheme_type || '',
      schemeCategory: data.meta.scheme_category || '',
      rating: 4, // Default rating since API doesn't provide this
      latestNav: parseFloat(data.data[0]?.nav || '0'),
      returns: calculateReturns(data.data),
      history: transformNavHistory(data.data)
    };
  } catch (error) {
    logger.error('Failed to fetch real fund details', { 
      schemeCode, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw new Error('Failed to fetch fund details');
  }
}

/**
 * Fetch NAV history for a specific fund
 */
export async function fetchRealFundNAV(schemeCode: string): Promise<MFNAV[]> {
  try {
    const response = await fetch(`${MF_API_BASE_URL}/mf/schemes/${schemeCode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch NAV data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return transformNavHistory(data.data);
  } catch (error) {
    logger.error('Failed to fetch real fund NAV', { 
      schemeCode, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw new Error('Failed to fetch fund NAV data');
  }
}

/**
 * Search for mutual funds
 */
export async function searchRealMFs(query: string): Promise<MFSearchResult[]> {
  try {
    const response = await fetch(`${MF_API_BASE_URL}/mf/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search funds: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform API response to match our application's data structure
    return data.schemes.slice(0, 40).map((scheme: any) => ({
      schemeCode: scheme.schemeCode,
      schemeName: scheme.schemeName,
      category: scheme.category || 'Unknown',
      rating: 4, // Default rating
      latestNav: parseFloat(scheme.nav || '0'),
      returns: { oneY: 0, threeY: 0, fiveY: 0 } // These would need to be calculated separately
    }));
  } catch (error) {
    logger.error('Failed to search real funds', { 
      query, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return [];
  }
}

/**
 * Transform NAV history data from API format to application format
 */
function transformNavHistory(navData: any[]): MFNAV[] {
  return navData.map(item => ({
    date: item.date,
    nav: parseFloat(item.nav)
  }));
}

/**
 * Calculate returns based on NAV history
 */
function calculateReturns(navData: any[]): { oneY: number; threeY: number; fiveY: number } {
  try {
    const latestNav = parseFloat(navData[0]?.nav || '0');
    
    // Find NAV from approximately 1, 3, and 5 years ago
    const oneYearAgo = findNavForPeriod(navData, 365);
    const threeYearsAgo = findNavForPeriod(navData, 365 * 3);
    const fiveYearsAgo = findNavForPeriod(navData, 365 * 5);
    
    // Calculate annualized returns
    const oneY = calculateAnnualizedReturn(latestNav, oneYearAgo.nav, 1);
    const threeY = calculateAnnualizedReturn(latestNav, threeYearsAgo.nav, 3);
    const fiveY = calculateAnnualizedReturn(latestNav, fiveYearsAgo.nav, 5);
    
    return { oneY, threeY, fiveY };
  } catch (error) {
    logger.error('Failed to calculate returns', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { oneY: 0, threeY: 0, fiveY: 0 };
  }
}

/**
 * Find NAV for a specific period ago
 */
function findNavForPeriod(navData: any[], daysAgo: number): { date: string; nav: number } {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - daysAgo);
  
  // Find the closest date in the data
  let closestEntry = navData[0];
  let minDiff = Infinity;
  
  for (const entry of navData) {
    const entryDate = new Date(entry.date);
    const diff = Math.abs(entryDate.getTime() - targetDate.getTime());
    
    if (diff < minDiff) {
      minDiff = diff;
      closestEntry = entry;
    }
  }
  
  return {
    date: closestEntry.date,
    nav: parseFloat(closestEntry.nav)
  };
}

/**
 * Calculate annualized return
 */
function calculateAnnualizedReturn(currentNav: number, pastNav: number, years: number): number {
  if (pastNav <= 0 || currentNav <= 0) return 0;
  
  // (Current NAV / Past NAV)^(1/years) - 1
  const totalReturn = currentNav / pastNav;
  const annualizedReturn = Math.pow(totalReturn, 1 / years) - 1;
  
  return annualizedReturn * 100; // Convert to percentage
}