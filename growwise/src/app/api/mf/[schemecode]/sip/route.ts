import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Fund from '@/lib/models/Fund';

function calculateSIPDates(startDate: Date, endDate: Date, frequency: string): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    switch (frequency) {
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarterly':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
  }
  return dates;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { schemecode: string } }
) {
  await dbConnect();
  const { schemecode } = params;
  const { amount, frequency, from, to } = await request.json();

  try {
    const fund = await Fund.findOne({ schemeCode: schemecode });

    if (!fund || !fund.navHistory || fund.navHistory.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Fund not found or no NAV data' },
        { status: 404 }
      );
    }

    const startDate = new Date(from);
    const endDate = new Date(to);
    const sipDates = calculateSIPDates(startDate, endDate, frequency);

    let totalInvested = 0;
    let totalUnits = 0;
    const breakdown: any[] = [];

    const navHistory = fund.navHistory.sort((a: { date: Date }, b: { date: Date }) => a.date.getTime() - b.date.getTime());

    for (const sipDate of sipDates) {
      const navEntry = [...navHistory].reverse().find(nav => nav.date <= sipDate);

      if (navEntry) {
        const units = amount / navEntry.nav;
        totalUnits += units;
        totalInvested += amount;
        breakdown.push({
          date: sipDate,
          nav: navEntry.nav,
          units,
          amount,
        });
      }
    }

    const latestNav = navHistory[navHistory.length - 1].nav;
    const currentValue = totalUnits * latestNav;
    const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;

    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 365);
    const annualizedReturn = years > 0 ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100 : absoluteReturn;

    return NextResponse.json({
      success: true,
      data: {
        totalInvested,
        currentValue,
        totalUnits,
        absoluteReturn: absoluteReturn.toFixed(2),
        annualizedReturn: annualizedReturn.toFixed(2),
        breakdown,
      },
    });
  } catch (error) {
    console.error(`Error calculating SIP for ${schemecode}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate SIP returns' },
      { status: 500 }
    );
  }
}
