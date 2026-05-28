import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', inWatchlist: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const schemeCode = searchParams.get('schemeCode');

    if (!schemeCode) {
      return NextResponse.json(
        { success: false, error: 'Scheme code is required', inWatchlist: false },
        { status: 400 }
      );
    }

    // Find the fund by scheme code
    const fund = await prisma.fund.findUnique({
      where: { schemeCode }
    });

    if (!fund) {
      return NextResponse.json(
        { success: false, error: 'Fund not found', inWatchlist: false },
        { status: 404 }
      );
    }

    // Check if the fund is in the user's watchlist
    const watchlistItem = await prisma.watchlistItem.findFirst({
      where: {
        userId: session.user.id,
        fundId: fund.id
      }
    });

    return NextResponse.json({
      success: true,
      inWatchlist: !!watchlistItem
    });

  } catch (error) {
    console.error('Error checking watchlist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check watchlist',
        inWatchlist: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}