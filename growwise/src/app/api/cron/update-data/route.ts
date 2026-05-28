import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint will be called by a cron job daily to update fund data
export async function GET(request: NextRequest) {
  try {
    // Verify API key for security (should be set in environment variables)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all funds from the database
    const funds = await prisma.fund.findMany({
      select: {
        id: true,
        schemeCode: true,
        schemeName: true
      }
    });

    // Update NAV data for each fund
    const updatePromises = funds.map(async (fund) => {
      try {
        // Fetch latest NAV data from external API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mf/${fund.schemeCode}/nav`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Get the latest NAV entry
          const latestNAV = data.data[data.data.length - 1];
          
          // Check if we already have this NAV date in our database
          const existingNAV = await prisma.fundNAV.findFirst({
            where: {
              fundId: fund.id,
              date: new Date(latestNAV.date)
            }
          });
          
          // Only insert if we don't already have this NAV date
          if (!existingNAV) {
            await prisma.fundNAV.create({
              data: {
                fundId: fund.id,
                date: new Date(latestNAV.date),
                nav: parseFloat(latestNAV.nav)
              }
            });
            return { schemeCode: fund.schemeCode, status: 'updated' };
          }
          
          return { schemeCode: fund.schemeCode, status: 'already-up-to-date' };
        }
        
        return { schemeCode: fund.schemeCode, status: 'no-data' };
      } catch (error) {
        console.error(`Error updating NAV for ${fund.schemeCode}:`, error);
        return { schemeCode: fund.schemeCode, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    // Count the results by status
    const summary = results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      success: true,
      message: 'NAV data update completed',
      summary,
      details: results
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update NAV data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}