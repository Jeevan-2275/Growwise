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

    const portfolios = await prisma.virtualPortfolio.findMany({
      where: { userId: session.user.id },
      include: {
        sipEntries: {
          include: {
            fund: true
          }
        }
      }
    });

    // Calculate portfolio performance
    const portfoliosWithPerformance = await Promise.all(
      portfolios.map(async (portfolio) => {
        let totalInvested = 0;
        let totalValue = 0;

        for (const sip of portfolio.sipEntries) {
          if (sip.isActive) {
            // Calculate SIP performance
            try {
              const response = await fetch(`/api/mf/${sip.fund.schemeCode}/sip`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  amount: sip.amount,
                  frequency: sip.frequency,
                  from: sip.startDate.toISOString().split('T')[0],
                  to: sip.endDate ? sip.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                })
              });

              const data = await response.json();
              if (data.success) {
                totalInvested += data.data.results.totalInvested;
                totalValue += data.data.results.currentValue;
              }
            } catch (error) {
              console.error(`Error calculating SIP performance for ${sip.fund.schemeCode}:`, error);
            }
          }
        }

        const absoluteReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

        return {
          id: portfolio.id,
          name: portfolio.name,
          description: portfolio.description,
          totalValue,
          totalInvested,
          absoluteReturn,
          sipEntries: portfolio.sipEntries.map(sip => ({
            id: sip.id,
            fund: {
              schemeCode: sip.fund.schemeCode,
              schemeName: sip.fund.schemeName,
              fundHouse: sip.fund.fundHouse
            },
            amount: sip.amount,
            frequency: sip.frequency,
            startDate: sip.startDate.toISOString().split('T')[0],
            endDate: sip.endDate ? sip.endDate.toISOString().split('T')[0] : null,
            isActive: sip.isActive,
            currentValue: 0, // Will be calculated individually
            totalInvested: 0, // Will be calculated individually
            absoluteReturn: 0 // Will be calculated individually
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: portfoliosWithPerformance
    });

  } catch (error) {
    console.error('Error fetching virtual portfolios:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch virtual portfolios',
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

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Portfolio name is required' },
        { status: 400 }
      );
    }

    const portfolio = await prisma.virtualPortfolio.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: 0,
        totalInvested: 0,
        absoluteReturn: 0,
        sipEntries: []
      }
    });

  } catch (error) {
    console.error('Error creating virtual portfolio:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create virtual portfolio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
