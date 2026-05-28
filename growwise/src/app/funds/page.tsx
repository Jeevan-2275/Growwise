'use client';

import { 
  Box, 
  Grid, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Skeleton,
  Button,
  Container,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Divider,
  FormControlLabel,
  Switch,
  Stack
} from '@mui/material';
import { useMemo, useState, useEffect, useCallback } from 'react';
import FundCard from '@/components/mf/FundCard';
import { useDebounce } from '@/hooks/useDebounce';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CompareIcon from '@mui/icons-material/Compare';
interface Fund {
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
  schemeType?: string;
  schemeCategory?: string;
  latestNAV?: { date: string; nav: number } | null;
  aum?: string;
  oneYearReturn?: string;
  threeYearReturn?: string;
  fiveYearReturn?: string;
  riskLevel?: string;
  isTrending?: boolean;
}

export default function FundsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fundHouseFilter, setFundHouseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [schemeTypeFilter, setSchemeTypeFilter] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'returns', 'aum'
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);

  const debouncedSearch = useDebounce(searchQuery, 500);
  
  // Fund categories with icons
  const fundCategories = [
    { name: 'High Return', icon: '📈', description: 'Funds with exceptional returns in the last year' },
    { name: 'Gold Funds', icon: '🥇', description: 'Funds that invest in gold and related securities' },
    { name: '5 Star Funds', icon: '⭐', description: 'Top-rated funds with 5-star ratings' },
    { name: 'Large Cap', icon: '🏢', description: 'Funds investing in large-cap companies' },
    { name: 'Mid Cap', icon: '🏭', description: 'Funds investing in mid-cap companies' },
    { name: 'Small Cap', icon: '🚀', description: 'Funds investing in small-cap companies' },
  ];

  // Fetch funds data
  const fetchFunds = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      console.log('Fetching funds data...');
      // Fetch funds matching search query only
      let url = '/api/mf';
      const params = [];
      if (debouncedSearch.trim()) params.push(`search=${encodeURIComponent(debouncedSearch)}`);
      if (fundHouseFilter) params.push(`fundHouse=${encodeURIComponent(fundHouseFilter)}`);
      if (categoryFilter) params.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (schemeTypeFilter) params.push(`schemeType=${encodeURIComponent(schemeTypeFilter)}`);
      if (params.length) url += '?' + params.join('&');
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`API response received, success: ${data.success}, data length: ${data.data?.length || 0}`);
      
      if (data.success) {
        // Map minimal API list (schemeCode, schemeName) to Fund shape
        const list: Fund[] = (data.data || []).map((f: any) => ({
          schemeCode: String(f.schemeCode || ''),
          schemeName: (typeof f.schemeName === 'string' && f.schemeName.match(/fund \d+$/i))
            ? (f.meta?.longName || f.meta?.scheme_name || f.meta?.fund_name || f.fundHouse + ' ' + (f.schemeCategory || f.schemeType || 'Fund'))
            : String(f.schemeName || f.meta?.longName || f.meta?.scheme_name || f.meta?.fund_name || 'Unknown Fund'),
          fundHouse: f.fundHouse || f.meta?.fund_house || 'Unknown',
          schemeType: f.schemeType || f.meta?.scheme_type || 'Other',
          schemeCategory: f.schemeCategory || f.meta?.scheme_category || 'Other',
          latestNAV: f.latestNAV ?? null,
          isActive: f.isActive !== false, // Default to true if not specified
          oneYearReturn: f.oneYearReturn || undefined,
          threeYearReturn: f.threeYearReturn || undefined,
          fiveYearReturn: f.fiveYearReturn || undefined,
          aum: f.aum || undefined,
          riskLevel: f.riskLevel || undefined,
          isTrending: Boolean(f.isTrending)
        }));
        // If latestNAV missing, fetch in bulk from /api/mf/nav (limit batch size)
        const missingCodes = list.filter(f => !f.latestNAV).slice(0, 100).map(f => f.schemeCode);
        console.log(`Fetching NAV data for ${missingCodes.length} funds...`);
        
        if (missingCodes.length > 0) {
          try {
            const navRes = await fetch('/api/mf/nav', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ schemeCodes: missingCodes })
            });
            
            if (!navRes.ok) {
              console.error(`NAV API responded with status: ${navRes.status}`);
              throw new Error(`NAV API error: ${navRes.status}`);
            }
            
            const navJson = await navRes.json();
            console.log(`NAV data received, success: ${navJson.success}, items: ${navJson.data?.length || 0}`);
            
            if (navJson?.success && Array.isArray(navJson.data)) {
              const codeToNav = new Map<string, { date: string; nav: number } | null>();
              for (const r of navJson.data as any[]) {
                codeToNav.set(String(r.schemeCode), r.latestNAV ?? null);
              }
              for (const f of list) {
                if (!f.latestNAV && codeToNav.has(f.schemeCode)) {
                  f.latestNAV = codeToNav.get(f.schemeCode) ?? null;
                }
              }
            }
          } catch (e) {
            console.error('Error fetching NAV data:', e);
          }
        }
        
        // Mark funds as active if they have recent NAV data
        for (const fund of list) {
          if (fund.latestNAV) {
            const navDate = new Date(fund.latestNAV.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - navDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // If NAV is more than 30 days old, mark as inactive
            if (diffDays > 30) {
              fund.isActive = false;
            }
          }
        }
        
        // Add some trending funds for demo purposes
        const trendingCount = Math.min(10, Math.floor(list.length * 0.05));
        for (let i = 0; i < trendingCount; i++) {
          const randomIndex = Math.floor(Math.random() * list.length);
          list[randomIndex].isTrending = true;
        }
        
        // Add some sample funds if the list is empty (for demo purposes)
        if (list.length === 0) {
           console.log('No funds returned, adding sample funds for demo');
           list.push(
             { schemeCode: '100001', schemeName: 'Sample Equity Fund', fundHouse: 'HDFC', schemeType: 'Open Ended', schemeCategory: 'Equity', latestNAV: { date: '2023-06-01', nav: 100.25 }, isActive: true, oneYearReturn: 12.5 },
             { schemeCode: '100002', schemeName: 'Sample Debt Fund', fundHouse: 'ICICI', schemeType: 'Open Ended', schemeCategory: 'Debt', latestNAV: { date: '2023-06-01', nav: 25.75 }, isActive: true, oneYearReturn: 8.2 },
             { schemeCode: '100003', schemeName: 'Sample Hybrid Fund', fundHouse: 'SBI', schemeType: 'Open Ended', schemeCategory: 'Hybrid', latestNAV: { date: '2023-06-01', nav: 50.50 }, isActive: true, oneYearReturn: 10.1 }
           );
         }
        
        setFunds(list);
        console.log('Funds loaded:', list.length, 'Active funds:', list.filter(f => f.isActive).length);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch funds');
      }
    } catch (err) {
      setError('Failed to fetch funds data');
      console.error('Error fetching funds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  // Toggle watchlist
  const toggleWatchlist = (schemeCode: string) => {
    setWatchlist(prev => {
      if (prev.includes(schemeCode)) {
        return prev.filter(code => code !== schemeCode);
      } else {
        return [...prev, schemeCode];
      }
    });
  };

  // Get unique fund houses and categories for filters
  const fundHouses = useMemo(() => {
    const houses = [...new Set(funds.map(f => f.fundHouse))].filter(Boolean).sort();
    return houses;
  }, [funds]);

  const categories = useMemo(() => {
    const cats = [...new Set(funds.map(f => f.schemeCategory))].filter(Boolean).sort();
    return cats;
  }, [funds]);
  
  const schemeTypes = useMemo(() => {
    const types = [...new Set(funds.map(f => f.schemeType))].filter(Boolean).sort();
    return types;
  }, [funds]);
  
  // Group funds by category for popular funds section
  const highReturnFunds = useMemo(() => {
    return funds.filter(fund => {
      const returnValue = parseFloat(fund.oneYearReturn as any);
      return !isNaN(returnValue) && returnValue > 15; // Funds with > 15% return
    }).slice(0, 6);
  }, [funds]);
  
  const growwisePicks = useMemo(() => {
    // In a real app, this would be based on some algorithm or expert picks
    return funds.filter(fund => fund.isTrending).slice(0, 6);
  }, [funds]);
  
  const trendingFunds = useMemo(() => {
    // In a real app, this would be based on popularity metrics
    return funds.slice(0, 6); // Just show first 6 for now
  }, [funds]);

  // Enhanced search functionality
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return funds;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    return funds.filter(fund => {
      const fundName = fund.schemeName.toLowerCase();
      const fundHouse = fund.fundHouse?.toLowerCase() || '';
      const schemeCode = fund.schemeCode || '';
      const category = fund.schemeCategory?.toLowerCase() || '';
      const type = fund.schemeType?.toLowerCase() || '';
      
      return searchTerms.every(term => 
        fundName.includes(term) || 
        fundHouse.includes(term) || 
        schemeCode.includes(term) ||
        category.includes(term) ||
        type.includes(term)
      );
    });
  }, [funds]);
  
  // Filter funds based on search and filters
  const filteredFunds = useMemo(() => {
    // Start with all funds
    let filtered = [...funds];
    
    // Make sure we have funds to filter
    if (filtered.length === 0) {
      return [];
    }

    console.log('Total funds before filtering:', filtered.length);

    // Filter by tab
    if (activeTab === 1) { // Watchlist tab
      filtered = filtered.filter(fund => watchlist.includes(fund.schemeCode));
      console.log('After watchlist filter:', filtered.length);
    }

    // Active funds filter - this is critical
    if (showActiveOnly) {
      filtered = filtered.filter(fund => fund.isActive !== false);
      console.log('After active filter:', filtered.length);
    }

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
      
      filtered = filtered.filter(fund => {
        const fundName = fund.schemeName?.toLowerCase() || '';
        const fundHouse = fund.fundHouse?.toLowerCase() || '';
        const schemeCode = fund.schemeCode || '';
        const category = fund.schemeCategory?.toLowerCase() || '';
        const type = fund.schemeType?.toLowerCase() || '';
        
        return searchTerms.every(term => 
          fundName.includes(term) || 
          fundHouse.includes(term) || 
          schemeCode.includes(term) ||
          category.includes(term) ||
          type.includes(term)
        );
      });
      console.log('After search filter:', filtered.length);
    }

    // Fund house filter
    if (fundHouseFilter) {
      filtered = filtered.filter(fund => fund.fundHouse === fundHouseFilter);
      console.log('After fund house filter:', filtered.length);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(fund => fund.schemeCategory === categoryFilter);
      console.log('After category filter:', filtered.length);
    }
    
    // Scheme type filter
    if (schemeTypeFilter) {
      filtered = filtered.filter(fund => fund.schemeType === schemeTypeFilter);
      console.log('After scheme type filter:', filtered.length);
    }

    // Apply sorting
    let sorted = [...filtered];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.schemeName.localeCompare(b.schemeName));
        break;
      case 'returns':
        sorted.sort((a, b) => {
          const returnA = parseFloat(a.oneYearReturn as any) || 0;
          const returnB = parseFloat(b.oneYearReturn as any) || 0;
          return returnB - returnA; // Descending order
        });
        break;
      case 'aum':
        sorted.sort((a, b) => {
          const aumA = parseFloat(a.aum as any) || 0;
          const aumB = parseFloat(b.aum as any) || 0;
          return aumB - aumA; // Descending order
        });
        break;
    }
    
    // If no funds match and we're filtering for active only, try showing inactive funds
    if (sorted.length === 0 && showActiveOnly) {
      console.log('No active funds match criteria, showing all funds');
      setShowActiveOnly(false);
    }
    
    return sorted;
  }, [funds, debouncedSearch, fundHouseFilter, categoryFilter, schemeTypeFilter, activeTab, watchlist]);

  // Diversify first N funds by interleaving different fund houses
  const diversifiedFunds = useMemo(() => {
    const buckets = new Map<string, Fund[]>();
    for (const f of filteredFunds) {
      const key = (f.fundHouse || 'Unknown').toLowerCase();
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(f);
    }
    const keys = Array.from(buckets.keys());
    // Round-robin pick from each bucket
    const result: Fund[] = [];
    let idx = 0;
    while (result.length < filteredFunds.length) {
      let added = false;
      for (let k = 0; k < keys.length; k++) {
        const bucket = buckets.get(keys[(k + idx) % keys.length])!;
        if (bucket.length) {
          result.push(bucket.shift()!);
          added = true;
        }
      }
      if (!added) break; // all empty
      idx++;
    }
    return result;
  }, [filteredFunds]);

  // Only show the first N funds in the grid
  const displayedFunds = useMemo(() => {
    // Make sure we have funds to display
    if (diversifiedFunds.length === 0 && funds.length > 0) {
      // If no funds match the filters, show a sample of all funds
      console.log('No funds match filters, showing sample of all funds');
      return funds.slice(0, itemsToShow);
    }
    return diversifiedFunds.slice(0, itemsToShow);
  }, [diversifiedFunds, itemsToShow, funds]);
  
  const canLoadMore = displayedFunds.length < filteredFunds.length;

  const clearFilters = () => {
    setSearchQuery('');
    setFundHouseFilter('');
    setCategoryFilter('');
    setSchemeTypeFilter('');
  };

  const activeFiltersCount = [fundHouseFilter, categoryFilter, schemeTypeFilter, debouncedSearch].filter(Boolean).length;

  // Reset pagination when filters or search change
  useEffect(() => {
    setItemsToShow(12);
  }, [debouncedSearch, fundHouseFilter, categoryFilter, schemeTypeFilter, activeTab]);

  if (loading && funds.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          Mutual Funds Explorer
        </Typography>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Mutual Funds Explorer
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Discover and analyze thousands of mutual funds with real-time data
        </Typography>
      </Box>

      {/* Fund Categories Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 3 }}>
          Fund Categories
        </Typography>
        <Grid container spacing={2}>
          {fundCategories.map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.name}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 3
                  }
                }}
                onClick={() => {
                  // Clear existing filters first
                  setSearchQuery('');
                  setFundHouseFilter('');
                  setSchemeTypeFilter('');
                  
                  if (category.name === 'High Return') {
                    setActiveTab(1); // switch to High Returns tab
                    setCategoryFilter('');
                  } else if (['Large Cap','Mid Cap','Small Cap'].includes(category.name)) {
                    setActiveTab(0);
                    setCategoryFilter(category.name);
                  } else if (category.name === 'Gold Funds') {
                    setActiveTab(0);
                    setCategoryFilter('');
                    setSearchQuery('Gold');
                  } else if (category.name === '5 Star Funds') {
                    setActiveTab(0);
                    setCategoryFilter('');
                    setSearchQuery('5 Star');
                  }
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 1 }}>{category.icon}</Box>
                <Typography variant="h6" align="center">{category.name}</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {category.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Popular Funds Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 2 }}>
          Popular Funds
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Top performing funds recommended by our analysts
        </Typography>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Trending" />
          <Tab label="High Returns" />
          <Tab label="Growwise Picks" />
        </Tabs>
        
        {/* Trending Funds */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {trendingFunds.map((fund) => (
              <Grid item xs={12} sm={6} md={4} key={fund.schemeCode}>
                <FundCard fund={fund} />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* High Return Funds */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {highReturnFunds.map((fund) => (
              <Grid item xs={12} sm={6} md={4} key={fund.schemeCode}>
                <FundCard fund={fund} />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Growwise Picks */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            {growwisePicks.map((fund) => (
              <Grid item xs={12} sm={6} md={4} key={fund.schemeCode}>
                <FundCard fund={fund} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Tabs */}
      <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="fund tabs"
        >
          <Tab label="All Funds" />
          <Tab label={`Watchlist (${watchlist.length})`} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by fund name, code, or fund house"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Reset pagination when search changes
                  setItemsToShow(12);
                }}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => {
                        setSearchQuery('');
                        setItemsToShow(12);
                      }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Fund House</InputLabel>
                <Select
                  value={fundHouseFilter}
                  onChange={(e) => setFundHouseFilter(e.target.value)}
                  label="Fund House"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }}
                >
                  <MenuItem value="">All Fund Houses</MenuItem>
                  {fundHouses.map(house => (
                    <MenuItem key={house} value={house}>{house}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }}>
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Scheme Type</InputLabel>
                <Select
                  value={schemeTypeFilter}
                  onChange={(e) => setSchemeTypeFilter(e.target.value)}
                  label="Scheme Type"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }}>
                  <MenuItem value="">All Types</MenuItem>
                  {schemeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={activeFiltersCount > 0 ? 6 : 3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={clearFilters}
                  disabled={!searchQuery && !fundHouseFilter && !categoryFilter && !schemeTypeFilter}
                  startIcon={<FilterListIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Clear Filters
                </Button>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="returns">Returns</MenuItem>
                    <MenuItem value="aum">AUM</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showActiveOnly}
                      onChange={(e) => setShowActiveOnly(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label="Active Funds Only"
                  sx={{ ml: 1 }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mt: 3, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Active filters:
          </Typography>
          {fundHouseFilter && (
            <Chip
              label={`Fund House: ${fundHouseFilter}`}
              onDelete={() => setFundHouseFilter('')}
              size="small"
              sx={{
                backgroundColor: 'primary.50',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'primary.200',
              }}
            />
          )}
          {categoryFilter && (
            <Chip
              label={`Category: ${categoryFilter}`}
              onDelete={() => setCategoryFilter('')}
              size="small"
              sx={{
                backgroundColor: 'primary.50',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'primary.200',
              }}
            />
          )}
          {schemeTypeFilter && (
            <Chip
              label={`Type: ${schemeTypeFilter}`}
              onDelete={() => setSchemeTypeFilter('')}
              size="small"
              sx={{
                backgroundColor: 'primary.50',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'primary.200',
              }}
            />
          )}
              <Chip
                label="Clear All"
                onClick={clearFilters}
                size="small"
                sx={{
                  backgroundColor: 'grey.100',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'grey.200',
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Showing {displayedFunds.length} of {filteredFunds.length} funds
        </Typography>

        {activeTab === 0 && (
          <Typography variant="body2" color="text.secondary">
            Click the star icon to add funds to your watchlist
          </Typography>
        )}
        {loading && (
          <CircularProgress size={24} color="primary" />
        )}
      </Box>

      {/* Funds Grid */}
      <Grid container spacing={3}>
        {displayedFunds.map((fund) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={fund.schemeCode}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip 
                    size="small" 
                    label={fund.schemeType || 'Fund'} 
                    color={
                      fund.schemeType === 'Equity' ? 'primary' : 
                      fund.schemeType === 'Debt' ? 'secondary' : 
                      fund.schemeType === 'Hybrid' ? 'info' : 
                      'default'
                    }
                    sx={{ borderRadius: 1 }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => toggleWatchlist(fund.schemeCode)}
                    color={watchlist.includes(fund.schemeCode) ? 'warning' : 'default'}
                  >
                    {watchlist.includes(fund.schemeCode) ? 
                      <StarIcon fontSize="small" /> : 
                      <StarBorderIcon fontSize="small" />
                    }
                  </IconButton>
                </Box>
                
                <Typography variant="h6" component="h3" sx={{ mb: 1, lineHeight: 1.3 }}>
                  {fund.schemeName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {fund.fundHouse || 'Fund House'}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                  Category: {fund.schemeCategory || 'N/A'}
                </Typography>

                {fund.latestNAV && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">NAV ({fund.latestNAV.date}):</Typography>
                    <Typography variant="body2" fontWeight="medium">₹{fund.latestNAV.nav.toFixed(2)}</Typography>
                  </Box>
                )}

                {fund.oneYearReturn && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">1Y Return:</Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      color={parseFloat(fund.oneYearReturn) > 0 ? 'success.main' : 'error.main'}
                    >
                      {fund.oneYearReturn}
                    </Typography>
                  </Box>
                )}

                {fund.riskLevel && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Risk:</Typography>
                    <Chip 
                      size="small" 
                      label={fund.riskLevel} 
                      color={
                        fund.riskLevel === 'Low' ? 'success' : 
                        fund.riskLevel === 'Moderate' ? 'info' : 
                        fund.riskLevel === 'Moderately High' ? 'warning' : 
                        fund.riskLevel === 'High' ? 'error' : 
                        'default'
                      }
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                )}
                
                <Box sx={{ mt: 'auto' }}>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      href={`/funds/${fund.schemeCode}`}
                      sx={{ borderRadius: 2 }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      href={`/funds/compare?funds=${fund.schemeCode}`}
                      sx={{ borderRadius: 2, minWidth: 'auto', px: 1 }}
                    >
                      <CompareIcon />
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {canLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => setItemsToShow((n) => n + 12)}
            sx={{ borderRadius: 2 }}
          >
            Load more
          </Button>
        </Box>
      )}

      {filteredFunds.length === 0 && !loading && (
        <Card sx={{ textAlign: 'center', py: 6, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No funds found matching your criteria
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search terms or filters to find more funds
            </Typography>
            <Button 
              variant="outlined" 
              onClick={clearFilters}
              sx={{ borderRadius: 2 }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
