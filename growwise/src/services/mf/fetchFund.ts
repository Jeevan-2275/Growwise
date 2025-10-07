import { getCachedData, CACHE_KEYS } from '@/lib/cache'
import { getMFDetails, getMFNAV, MFDetails, MFNAV } from '@/lib/mf'
import { logger } from '@/lib/logger'

export interface FundWithNAV extends MFDetails {
  navHistory: MFNAV[]
}

export async function fetchFundDetails(schemeCode: string): Promise<FundWithNAV> {
  try {
    const [details, navHistory] = await Promise.all([
      getCachedData(
        `${CACHE_KEYS.MF_DETAILS}-${schemeCode}`,
        () => getMFDetails(schemeCode),
        { revalidate: 3600, tags: ['mf-details'] }
      )(),
      getCachedData(
        `${CACHE_KEYS.MF_NAV}-${schemeCode}`,
        () => getMFNAV(schemeCode),
        { revalidate: 1800, tags: ['mf-nav'] }
      )()
    ])

    return {
      ...details,
      navHistory,
    }
  } catch (error) {
    logger.error('Failed to fetch fund details', { schemeCode, error: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Failed to fetch fund details')
  }
}

export async function fetchFundNAV(schemeCode: string, fromDate?: string, toDate?: string): Promise<MFNAV[]> {
  try {
    const cacheKey = `${CACHE_KEYS.MF_NAV}-${schemeCode}-${fromDate || 'all'}-${toDate || 'all'}`
    
    return await getCachedData(
      cacheKey,
      () => getMFNAV(schemeCode, fromDate, toDate),
      { revalidate: 1800, tags: ['mf-nav'] }
    )()
  } catch (error) {
    logger.error('Failed to fetch fund NAV', { schemeCode, fromDate, toDate, error: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Failed to fetch fund NAV data')
  }
}
