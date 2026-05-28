import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Fund from '@/lib/models/Fund';

export async function GET(
  request: NextRequest,
  { params }: { params: { schemecode: string } }
) {
  await dbConnect();
  const { schemecode } = params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    const fund = await Fund.findOne({ schemeCode: schemecode });

    if (!fund || !fund.navHistory || fund.navHistory.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Fund not found or no NAV data' },
        { status: 404 }
      );
    }

    let startDate: Date;
    let endDate: Date = new Date();

    if (period) {
      const now = new Date();
      switch (period) {
        case '1m':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case '3m':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case '6m':
          startDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid period' },
            { status: 400 }
          );
      }
    } else if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing period or date range' },
        { status: 400 }
      );
    }

    const navHistory = fund.navHistory.sort((a: { date: Date }, b: { date: Date }) => a.date.getTime() - b.date.getTime());

    const startEntry = navHistory.find((nav: { date: Date }) => nav.date >= startDate);
    const endEntry = [...navHistory].reverse().find(nav => nav.date <= endDate);

    if (!startEntry || !endEntry) {
      return NextResponse.json(
        { success: false, error: 'Insufficient data for the period' },
        { status: 400 }
      );
    }

    const startNAV = startEntry.nav;
    const endNAV = endEntry.nav;
    const daysDiff = (endEntry.date.getTime() - startEntry.date.getTime()) / (1000 * 3600 * 24);

    const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;
    let annualizedReturn = null;

    if (daysDiff >= 365) {
      const years = daysDiff / 365;
      annualizedReturn = (Math.pow(1 + simpleReturn / 100, 1 / years) - 1) * 100;
    }

    return NextResponse.json({
      success: true,
      data: {
        schemeCode: fund.schemeCode,
        schemeName: fund.schemeName,
        startDate: startEntry.date,
        endDate: endEntry.date,
        startNAV,
        endNAV,
        simpleReturn: simpleReturn.toFixed(2),
        annualizedReturn: annualizedReturn ? annualizedReturn.toFixed(2) : null,
      },
    });
  } catch (error) {
    console.error(`Error calculating returns for ${schemecode}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate returns' },
      { status: 500 }
    );
  }
}
