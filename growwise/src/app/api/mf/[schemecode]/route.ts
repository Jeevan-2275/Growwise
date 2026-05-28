import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Fund from '@/lib/models/Fund';

const MFAPI_BASE_URL = process.env.MFAPI_BASE_URL || 'https://api.mfapi.in';

async function fetchSchemeDetailsFromAPI(schemeCode: string) {
  const response = await fetch(`${MFAPI_BASE_URL}/mf/${schemeCode}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function GET(
  request: Request,
  { params }: { params: { schemecode: string } }
) {
  await dbConnect();
  const { schemecode } = params;

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let fund = await Fund.findOne({ schemeCode: schemecode });

    if (fund && fund.lastUpdated >= oneDayAgo) {
      return NextResponse.json({ success: true, data: fund, source: 'db' });
    }

    const apiData = await fetchSchemeDetailsFromAPI(schemecode);

    if (!apiData) {
      if (fund) {
        // Return stale data if API fails
        return NextResponse.json({ success: true, data: fund, source: 'stale_db' });
      }
      return NextResponse.json(
        { success: false, error: 'Fund not found' },
        { status: 404 }
      );
    }

    const navHistory = apiData.data.map((navInfo: any) => ({
      date: new Date(navInfo.date.split('-').reverse().join('-')), // Convert DD-MM-YYYY to YYYY-MM-DD
      nav: parseFloat(navInfo.nav),
    }));

    const updatedFundData = {
      schemeCode: schemecode,
      schemeName: apiData.meta.scheme_name,
      fundHouse: apiData.meta.fund_house,
      schemeType: apiData.meta.scheme_type,
      schemeCategory: apiData.meta.scheme_category,
      navHistory: navHistory,
      lastUpdated: new Date(),
    };

    fund = await Fund.findOneAndUpdate(
      { schemeCode: schemecode },
      updatedFundData,
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: fund, source: 'api' });
  } catch (error) {
    console.error(`Error in /api/mf/${schemecode}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheme details' },
      { status: 500 }
    );
  }
}
