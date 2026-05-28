import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { fundId, amount, frequency, startDate, endDate } = await request.json();

    if (!id || !fundId || !amount || !frequency || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify portfolio belongs to user
    const portfolio = await prisma.virtualPortfolio.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found or access denied' },
        { status: 404 }
      );
    }

    // Verify fund exists
    const fund = await prisma.fund.findUnique({
      where: { schemeCode: fundId }
    });

    if (!fund) {
      return NextResponse.json(
        { success: false, error: 'Fund not found' },
        { status: 404 }
      );
    }

    // Create SIP entry
    const sip = await prisma.virtualSIP.create({
      data: {
        portfolioId: id,
        fundId: fund.id,
        amount: amount,
        frequency: frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
      },
      include: {
        fund: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
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
        isActive: sip.isActive
      }
    });

  } catch (error) {
    console.error('Error creating SIP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create SIP',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
