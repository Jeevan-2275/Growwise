import { unstable_cache } from 'next/cache'

// Server-side caching helper
export const getCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    revalidate?: number | false
    tags?: string[]
  }
) => {
  return unstable_cache(fetcher, [key], {
    revalidate: options?.revalidate || 3600, // 1 hour default
    tags: options?.tags || [],
  })
}

// Client-side caching with SWR
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  dedupingInterval: 2000,
}

// Cache keys
export const CACHE_KEYS = {
  MF_SEARCH: 'mf-search',
  MF_DETAILS: 'mf-details',
  MF_NAV: 'mf-nav',
  USER_PORTFOLIO: 'user-portfolio',
} as const
