import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MFAPI_BASE = 'https://api.mfapi.in/mf';

export async function POST(request: NextRequest) {
  try {
    const { schemeCodes } = await request.json();

    if (!Array.isArray(schemeCodes) || schemeCodes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'schemeCodes array is required' },
        { status: 400 }
      );
    }

    // Limit to 100 funds per request to avoid timeout
    const codesToFetch = schemeCodes.slice(0, 100);
    
    console.log(`Fetching NAV data for ${codesToFetch.length} funds...`);

    const navResults = await Promise.allSettled(
      codesToFetch.map(async (schemeCode: string) => {
        try {
          // Check if we have recent NAV data in database
          const fund = await prisma.fund.findUnique({
            where: { schemeCode },
            include: {
              navHistory: {
                orderBy: { date: 'desc' },
                take: 1
              }
            }
          });

          if (fund && fund.navHistory.length > 0) {
            const latestNav = fund.navHistory[0];
            const hoursSinceUpdate = (Date.now() - fund.lastUpdated.getTime()) / (1000 * 60 * 60);
            
            // If we have data less than 24 hours old, use it
            if (hoursSinceUpdate < 24) {
              return {
                schemeCode,
                latestNAV: {
                  date: latestNav.date.toISOString().split('T')[0],
                  nav: latestNav.nav
                },
                cached: true
              };
            }
          }

          // Fetch fresh data from MFAPI.in
          const response = await fetch(`${MFAPI_BASE}/${schemeCode}`, {
            headers: {
              'User-Agent': 'Growwise/1.0',
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          
          if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid data format');
          }

          // Process NAV data
          const navHistory = data.data
            .filter((item: any) => item.nav && item.nav !== '0.00000' && item.nav !== '0.00')
            .map((item: any) => ({
              date: new Date(item.date),
              nav: parseFloat(item.nav)
            }))
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

          if (navHistory.length === 0) {
            throw new Error('No valid NAV data');
          }

          const latestNav = navHistory[0];

          // Update fund in database
          await prisma.fund.upsert({
            where: { schemeCode },
            update: {
              schemeName: data.meta?.scheme_name || data.meta?.schemeName || 'Unknown',
              fundHouse: data.meta?.fund_house || data.meta?.fundHouse || 'Unknown',
              schemeType: data.meta?.scheme_type || data.meta?.schemeType || 'Unknown',
              schemeCategory: data.meta?.scheme_category || data.meta?.schemeCategory || 'Unknown',
              isActive: true,
              lastUpdated: new Date()
            },
            create: {
              schemeCode,
              schemeName: data.meta?.scheme_name || data.meta?.schemeName || 'Unknown',
              fundHouse: data.meta?.fund_house || data.meta?.fundHouse || 'Unknown',
              schemeType: data.meta?.scheme_type || data.meta?.schemeType || 'Unknown',
              schemeCategory: data.meta?.scheme_category || data.meta?.schemeCategory || 'Unknown',
              isActive: true
            }
          });

          // Store NAV history
          await prisma.fundNAV.deleteMany({
            where: { 
              fund: { schemeCode },
              date: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Keep only last 7 days
            }
          });

          await prisma.fundNAV.createMany({
            data: navHistory.slice(0, 30).map((nav: any) => ({
              fund: { connect: { schemeCode } },
              date: nav.date,
              nav: nav.nav
            }))
          });

          return {
            schemeCode,
            latestNAV: {
              date: latestNav.date.toISOString().split('T')[0],
              nav: latestNav.nav
            },
            cached: false
          };

        } catch (error) {
          console.error(`Error fetching NAV for ${schemeCode}:`, error);
          return {
            schemeCode,
            error: error instanceof Error ? error.message : 'Unknown error',
            latestNAV: null
          };
        }
      })
    );

    const results = navResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          schemeCode: codesToFetch[index],
          error: result.reason?.message || 'Unknown error',
          latestNAV: null
        };
      }
    });

    const successful = results.filter(r => r.latestNAV);
    const failed = results.filter(r => !r.latestNAV);

    return NextResponse.json({
      success: true,
      data: results,
      stats: {
        total: codesToFetch.length,
        successful: successful.length,
        failed: failed.length,
        cached: successful.filter(r => r.cached).length,
        fresh: successful.filter(r => !r.cached).length
      }
    });

  } catch (error) {
    console.error('Error in bulk NAV fetch:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch NAV data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}