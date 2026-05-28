import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
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
    const { isActive } = await request.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    // Verify SIP belongs to user's portfolio
    const sip = await prisma.virtualSIP.findFirst({
      where: {
        id: id,
        portfolio: {
          userId: session.user.id
        }
      }
    });

    if (!sip) {
      return NextResponse.json(
        { success: false, error: 'SIP not found or access denied' },
        { status: 404 }
      );
    }

    // Update SIP status
    await prisma.virtualSIP.update({
      where: { id: id },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      message: `SIP ${isActive ? 'activated' : 'paused'} successfully`
    });

  } catch (error) {
    console.error('Error updating SIP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update SIP',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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

    // Verify SIP belongs to user's portfolio
    const sip = await prisma.virtualSIP.findFirst({
      where: {
        id: id,
        portfolio: {
          userId: session.user.id
        }
      }
    });

    if (!sip) {
      return NextResponse.json(
        { success: false, error: 'SIP not found or access denied' },
        { status: 404 }
      );
    }

    // Delete SIP
    await prisma.virtualSIP.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'SIP deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting SIP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete SIP',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
