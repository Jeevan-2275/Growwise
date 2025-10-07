import { getCachedData, CACHE_KEYS } from '@/lib/cache'
import { searchMFs, MFSearchResult } from '@/lib/mf'
import { logger } from '@/lib/logger'

export async function searchFunds(query: string): Promise<MFSearchResult[]> {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const cacheKey = `${CACHE_KEYS.MF_SEARCH}-${query.toLowerCase().trim()}`
    
    return await getCachedData(
      cacheKey,
      () => searchMFs(query.trim()),
      { revalidate: 7200, tags: ['mf-search'] } // 2 hours cache
    )()
  } catch (error) {
    logger.error('Failed to search funds', { query, error: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Failed to search mutual funds')
  }
}

export async function getPopularFunds(): Promise<MFSearchResult[]> {
  try {
    // Popular fund search terms
    const popularQueries = ['equity', 'debt', 'hybrid', 'index']
    
    const results = await Promise.all(
      popularQueries.map(query => searchFunds(query))
    )
    
    // Flatten and deduplicate results
    const allFunds = results.flat()
    const uniqueFunds = allFunds.filter((fund, index, self) => 
      index === self.findIndex(f => f.schemeCode === fund.schemeCode)
    )
    
    return uniqueFunds.slice(0, 20) // Return top 20 popular funds
  } catch (error) {
    logger.error('Failed to get popular funds', { error: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Failed to fetch popular funds')
  }
}
