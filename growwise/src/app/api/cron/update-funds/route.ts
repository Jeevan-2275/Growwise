import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MFAPI_BASE = 'https://api.mfapi.in/mf';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (you might want to add authentication)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily fund data update...');

    // Fetch all funds from MFAPI.in
    const response = await fetch(MFAPI_BASE, {
      headers: {
        'User-Agent': 'Growwise/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`MFAPI.in responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format from MFAPI.in');
    }

    // Process all funds from MFAPI.in
    const allFunds = data.filter((fund: any) => fund.schemeCode && fund.schemeName);
    console.log(`Processing ${allFunds.length} total funds from MFAPI.in...`);

    let updatedCount = 0;
    let newCount = 0;
    let errorCount = 0;
    let activeFundsCount = 0;

    // Update funds in database
    for (const fund of allFunds) {
      try {
        const existingFund = await prisma.fund.findUnique({
          where: { schemeCode: fund.schemeCode }
        });

        if (existingFund) {
          // Update existing fund
          await prisma.fund.update({
            where: { schemeCode: fund.schemeCode },
            data: {
              schemeName: fund.schemeName,
              fundHouse: existingFund.fundHouse || 'Unknown',
              schemeType: existingFund.schemeType || 'Unknown',
              schemeCategory: existingFund.schemeCategory || 'Unknown',
              isActive: true,
              lastUpdated: new Date()
            }
          });
          updatedCount++;
        } else {
          // Create new fund
          await prisma.fund.create({
            data: {
              schemeCode: fund.schemeCode,
              schemeName: fund.schemeName,
              fundHouse: 'Unknown',
              schemeType: 'Unknown',
              schemeCategory: 'Unknown',
              isActive: true
            }
          });
          newCount++;
        }
      } catch (error) {
        console.error(`Error processing fund ${fund.schemeCode}:`, error);
        errorCount++;
      }
    }

    // Now fetch NAV data for a sample of funds to identify active ones
    console.log('Fetching NAV data for sample funds to identify active ones...');
    const sampleSize = Math.min(1000, allFunds.length);
    const sampleFunds = allFunds.slice(0, sampleSize);
    
    for (const fund of sampleFunds) {
      try {
        // Fetch NAV data for this fund
        const navResponse = await fetch(`${MFAPI_BASE}/${fund.schemeCode}`, {
          headers: {
            'User-Agent': 'Growwise/1.0',
            'Accept': 'application/json'
          }
        });

        if (navResponse.ok) {
          const navData = await navResponse.json();
          
          if (navData.data && Array.isArray(navData.data)) {
            const navHistory = navData.data
              .filter((item: any) => item.nav && item.nav !== '0.00000' && item.nav !== '0.00')
              .map((item: any) => ({
                date: new Date(item.date),
                nav: parseFloat(item.nav)
              }))
              .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

            if (navHistory.length > 0) {
              const latestNav = navHistory[0];
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

              // Check if fund has recent NAV data
              if (latestNav.date >= thirtyDaysAgo && latestNav.nav > 0) {
                // Update fund metadata
                await prisma.fund.update({
                  where: { schemeCode: fund.schemeCode },
                  data: {
                    schemeName: navData.meta?.scheme_name || navData.meta?.schemeName || fund.schemeName,
                    fundHouse: navData.meta?.fund_house || navData.meta?.fundHouse || 'Unknown',
                    schemeType: navData.meta?.scheme_type || navData.meta?.schemeType || 'Unknown',
                    schemeCategory: navData.meta?.scheme_category || navData.meta?.schemeCategory || 'Unknown',
                    isActive: true,
                    lastUpdated: new Date()
                  }
                });

                // Store recent NAV history
                await prisma.fundNAV.deleteMany({
                  where: { 
                    fund: { schemeCode: fund.schemeCode },
                    date: { lt: thirtyDaysAgo }
                  }
                });

                await prisma.fundNAV.createMany({
                  data: navHistory.slice(0, 30).map((nav: any) => ({
                    fund: { connect: { schemeCode: fund.schemeCode } },
                    date: nav.date,
                    nav: nav.nav
                  }))
                });

                activeFundsCount++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching NAV for ${fund.schemeCode}:`, error);
      }
    }

    // Mark funds not in the current list as inactive
    const currentSchemeCodes = allFunds.map((f: any) => f.schemeCode);
    await prisma.fund.updateMany({
      where: {
        schemeCode: { notIn: currentSchemeCodes },
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    console.log('Daily fund data update completed:', {
      total: allFunds.length,
      updated: updatedCount,
      new: newCount,
      errors: errorCount,
      activeFunds: activeFundsCount,
      sampleSize: sampleSize
    });

    return NextResponse.json({
      success: true,
      message: 'Daily fund data update completed',
      stats: {
        total: allFunds.length,
        updated: updatedCount,
        new: newCount,
        errors: errorCount,
        activeFunds: activeFundsCount,
        sampleSize: sampleSize,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in daily fund data update:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update fund data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
