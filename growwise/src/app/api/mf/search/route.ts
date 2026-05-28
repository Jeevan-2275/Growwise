import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const limit = Math.min(Number(searchParams.get('limit') || '50'), 100);

    // Find active funds optionally filtered by name/code
    const funds = await prisma.fund.findMany({
      where: {
        isActive: true,
        OR: q
          ? [
              { schemeName: { contains: q, mode: 'insensitive' } },
              { schemeCode: { equals: q } },
            ]
          : undefined,
      },
      select: {
        id: true,
        schemeCode: true,
        schemeName: true,
        fundHouse: true,
        schemeCategory: true,
        lastUpdated: true,
      },
      take: limit,
      orderBy: { schemeName: 'asc' },
    });

    // Attach latest NAV per fund
    const withNav = await Promise.all(
      funds.map(async (f) => {
        const latest = await prisma.fundNAV.findFirst({
          where: { fundId: f.id },
          orderBy: { date: 'desc' },
          select: { date: true, nav: true },
        });
        return {
          schemeCode: f.schemeCode,
          schemeName: f.schemeName,
          fundHouse: f.fundHouse,
          schemeCategory: f.schemeCategory,
          latestNAV: latest ? { date: latest.date.toISOString().split('T')[0], nav: latest.nav } : null,
        };
      })
    );

    // Optionally filter to only funds with NAV as of today
    const onlyToday = searchParams.get('onlyToday') === 'true';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const results = onlyToday
      ? withNav.filter((f) => f.latestNAV && f.latestNAV.date === todayStr)
      : withNav;

    return NextResponse.json({ success: true, data: results, total: results.length });
  } catch (error) {
    console.error('Error in /api/mf/search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search funds',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

