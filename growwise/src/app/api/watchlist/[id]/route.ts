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
        { success: false, error: 'Watchlist item ID is required' },
        { status: 400 }
      );
    }

    // Check if the watchlist item belongs to the user
    const watchlistItem = await prisma.watchlistItem.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!watchlistItem) {
      return NextResponse.json(
        { success: false, error: 'Watchlist item not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the watchlist item
    await prisma.watchlistItem.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Fund removed from watchlist'
    });

  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove from watchlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}