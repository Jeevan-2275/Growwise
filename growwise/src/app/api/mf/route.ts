import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Fund from '@/lib/models/Fund';

const MFAPI_BASE_URL = process.env.MFAPI_BASE_URL || 'https://api.mfapi.in';

async function fetchAllFundsFromAPI() {
  const response = await fetch(`${MFAPI_BASE_URL}/mf`);
  if (!response.ok) {
    throw new Error('Failed to fetch from MFAPI');
  }
  const data = await response.json();
  return data.map((fund: any) => ({
    schemeCode: String(fund.schemeCode),
    schemeName: fund.schemeName,
  }));
}

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('search');

  try {
    let funds;

    if (searchQuery) {
      funds = await Fund.find({
        schemeName: { $regex: searchQuery, $options: 'i' },
      }).limit(50);
    } else {
      // Check if we have funds in the DB, and if they are recent
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const fundCount = await Fund.countDocuments();
      const recentFund = await Fund.findOne({ lastUpdated: { $gte: oneDayAgo } });

      if (fundCount > 0 && recentFund) {
        funds = await Fund.find({}).limit(100); // Return a sample from DB
      } else {
        // Fetch from API, update DB
        const apiFunds = await fetchAllFundsFromAPI();
        // Use bulk write for efficiency
        const operations = apiFunds.map((fund: any) => ({
          updateOne: {
            filter: { schemeCode: fund.schemeCode },
            update: { $set: { ...fund, lastUpdated: new Date() } },
            upsert: true,
          },
        }));
        await Fund.bulkWrite(operations);
        funds = apiFunds.slice(0, 100); // Return a sample from API
      }
    }

    return NextResponse.json({ success: true, data: funds }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/mf:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mutual fund data' },
      { status: 500 }
    );
  }
}
