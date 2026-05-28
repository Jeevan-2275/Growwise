import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        fund: true
      }
    });

    const baseUrl = request.nextUrl.origin;

    // Calculate performance for each fund
    const watchlistWithPerformance = await Promise.all(
      watchlist.map(async (item) => {
        try {
          // Fetch returns for different periods
          const [oneDay, oneMonth, threeMonths, sixMonths, oneYear] = await Promise.all([
            fetch(`${baseUrl}/api/mf/${item.fund.schemeCode}/returns?period=1d`).then(r => r.json()),
            fetch(`${baseUrl}/api/mf/${item.fund.schemeCode}/returns?period=1m`).then(r => r.json()),
            fetch(`${baseUrl}/api/mf/${item.fund.schemeCode}/returns?period=3m`).then(r => r.json()),
            fetch(`${baseUrl}/api/mf/${item.fund.schemeCode}/returns?period=6m`).then(r => r.json()),
            fetch(`${baseUrl}/api/mf/${item.fund.schemeCode}/returns?period=1y`).then(r => r.json())
          ]);

          return {
            id: item.id,
            fund: {
              schemeCode: item.fund.schemeCode,
              schemeName: item.fund.schemeName,
              fundHouse: item.fund.fundHouse,
              schemeCategory: item.fund.schemeCategory
            },
            performance: {
              oneDay: oneDay.success ? oneDay.data.simpleReturn : 0,
              oneMonth: oneMonth.success ? oneMonth.data.simpleReturn : 0,
              threeMonths: threeMonths.success ? threeMonths.data.simpleReturn : 0,
              sixMonths: sixMonths.success ? sixMonths.data.simpleReturn : 0,
              oneYear: oneYear.success ? oneYear.data.simpleReturn : 0
            }
          };
        } catch (error) {
          console.error(`Error calculating performance for fund ${item.fund.schemeCode}:`, error);
          return {
            id: item.id,
            fund: {
              schemeCode: item.fund.schemeCode,
              schemeName: item.fund.schemeName,
              fundHouse: item.fund.fundHouse,
              schemeCategory: item.fund.schemeCategory
            },
            performance: {
              oneDay: 0,
              oneMonth: 0,
              threeMonths: 0,
              sixMonths: 0,
              oneYear: 0
            }
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: watchlistWithPerformance
    });

  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch watchlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { schemeCode } = await request.json();

    if (!schemeCode) {
      return NextResponse.json(
        { success: false, error: 'Scheme code is required' },
        { status: 400 }
      );
    }

    // Check if fund exists
    const fund = await prisma.fund.findUnique({
      where: { schemeCode }
    });

    if (!fund) {
      return NextResponse.json(
        { success: false, error: 'Fund not found' },
        { status: 404 }
      );
    }

    // Check if already in watchlist
    const existingItem = await prisma.watchlistItem.findUnique({
      where: {
        userId_fundId: {
          userId: session.user.id,
          fundId: fund.id
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: 'Fund already in watchlist' },
        { status: 400 }
      );
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        userId: session.user.id,
        fundId: fund.id
      },
      include: {
        fund: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: watchlistItem.id,
        fund: {
          schemeCode: watchlistItem.fund.schemeCode,
          schemeName: watchlistItem.fund.schemeName,
          fundHouse: watchlistItem.fund.fundHouse,
          schemeCategory: watchlistItem.fund.schemeCategory
        }
      }
    });

  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add to watchlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
