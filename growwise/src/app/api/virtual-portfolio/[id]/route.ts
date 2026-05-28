import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Check if the portfolio belongs to the user
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

    // Delete the portfolio (cascade will delete SIP entries)
    await prisma.virtualPortfolio.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete portfolio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
