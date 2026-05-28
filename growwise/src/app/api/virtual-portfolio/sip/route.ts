import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Add a new SIP entry to a virtual portfolio
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      portfolioId, 
      schemeCode, 
      amount, 
      frequency, 
      startDate, 
      endDate = null 
    } = body;
    
    // Validate required fields
    if (!portfolioId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }
    
    if (!schemeCode) {
      return NextResponse.json(
        { success: false, error: 'Scheme code is required' },
        { status: 400 }
      );
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    
    if (!frequency || !['monthly', 'quarterly', 'yearly'].includes(frequency)) {
      return NextResponse.json(
        { success: false, error: 'Valid frequency is required (monthly, quarterly, yearly)' },
        { status: 400 }
      );
    }
    
    if (!startDate) {
      return NextResponse.json(
        { success: false, error: 'Start date is required' },
        { status: 400 }
      );
    }
    
    // Verify portfolio belongs to user
    const portfolio = await prisma.virtualPortfolio.findUnique({
      where: {
        id: portfolioId,
        userId: session.user.id
      }
    });
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found or access denied' },
        { status: 404 }
      );
    }
    
    // Find or create fund
    let fund = await prisma.fund.findUnique({
      where: { schemeCode }
    });
    
    if (!fund) {
      // Fetch fund details from API
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mf/${schemeCode}`);
        const data = await response.json();
        
        if (data.success) {
          fund = await prisma.fund.create({
            data: {
              schemeCode,
              schemeName: data.data.schemeName,
              fundHouse: data.data.fundHouse,
              category: data.data.category || 'Unknown',
              subCategory: data.data.subCategory || 'Unknown',
              schemeType: data.data.schemeType || 'Unknown'
            }
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid scheme code' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch fund details' },
          { status: 500 }
        );
      }
    }
    
    // Create SIP entry
    const sipEntry = await prisma.virtualSIP.create({
      data: {
        virtualPortfolioId: portfolioId,
        fundId: fund.id,
        amount,
        frequency,
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
        id: sipEntry.id,
        fund: {
          schemeCode: sipEntry.fund.schemeCode,
          schemeName: sipEntry.fund.schemeName,
          fundHouse: sipEntry.fund.fundHouse
        },
        amount: sipEntry.amount,
        frequency: sipEntry.frequency,
        startDate: sipEntry.startDate.toISOString(),
        endDate: sipEntry.endDate?.toISOString() || null,
        isActive: sipEntry.isActive
      }
    });
  } catch (error) {
    console.error('Error creating SIP entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create SIP entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a SIP entry from a virtual portfolio
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const sipId = searchParams.get('id');
    
    if (!sipId) {
      return NextResponse.json(
        { success: false, error: 'SIP ID is required' },
        { status: 400 }
      );
    }
    
    // Verify SIP entry belongs to user's portfolio
    const sipEntry = await prisma.virtualSIP.findFirst({
      where: {
        id: sipId,
        virtualPortfolio: {
          userId: session.user.id
        }
      }
    });
    
    if (!sipEntry) {
      return NextResponse.json(
        { success: false, error: 'SIP entry not found or access denied' },
        { status: 404 }
      );
    }
    
    // Delete SIP entry
    await prisma.virtualSIP.delete({
      where: { id: sipId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'SIP entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SIP entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete SIP entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH - Update a SIP entry
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { 
      id, 
      amount, 
      frequency, 
      startDate, 
      endDate,
      isActive 
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'SIP ID is required' },
        { status: 400 }
      );
    }
    
    // Verify SIP entry belongs to user's portfolio
    const sipEntry = await prisma.virtualSIP.findFirst({
      where: {
        id,
        virtualPortfolio: {
          userId: session.user.id
        }
      },
      include: {
        fund: true
      }
    });
    
    if (!sipEntry) {
      return NextResponse.json(
        { success: false, error: 'SIP entry not found or access denied' },
        { status: 404 }
      );
    }
    
    // Update SIP entry
    const updatedSipEntry = await prisma.virtualSIP.update({
      where: { id },
      data: {
        amount: amount !== undefined ? amount : undefined,
        frequency: frequency !== undefined ? frequency : undefined,
        startDate: startDate !== undefined ? new Date(startDate) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      include: {
        fund: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedSipEntry.id,
        fund: {
          schemeCode: updatedSipEntry.fund.schemeCode,
          schemeName: updatedSipEntry.fund.schemeName,
          fundHouse: updatedSipEntry.fund.fundHouse
        },
        amount: updatedSipEntry.amount,
        frequency: updatedSipEntry.frequency,
        startDate: updatedSipEntry.startDate.toISOString(),
        endDate: updatedSipEntry.endDate?.toISOString() || null,
        isActive: updatedSipEntry.isActive
      }
    });
  } catch (error) {
    console.error('Error updating SIP entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update SIP entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}