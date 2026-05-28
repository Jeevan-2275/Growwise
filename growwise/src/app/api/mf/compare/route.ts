import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { schemeCodes } = await request.json();

    if (!Array.isArray(schemeCodes) || schemeCodes.length < 2 || schemeCodes.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide 2-5 scheme codes for comparison' },
        { status: 400 }
      );
    }

    // Fetch fund details and NAV history for comparison
    const funds = await Promise.all(
      schemeCodes.map(async (schemeCode: string) => {
        try {
          const fund = await prisma.fund.findUnique({
            where: { schemeCode },
            include: {
              navHistory: {
                orderBy: { date: 'desc' },
                take: 365 // Last year of data
              }
            }
          });

          if (!fund || fund.navHistory.length === 0) {
            return null;
          }

          // Calculate returns for different periods
          const navHistory = fund.navHistory.sort((a, b) => a.date.getTime() - b.date.getTime());
          const latestNav = navHistory[navHistory.length - 1].nav;
          const oneMonthAgo = navHistory.find(nav => {
            const oneMonth = new Date();
            oneMonth.setMonth(oneMonth.getMonth() - 1);
            return nav.date >= oneMonth;
          });
          const threeMonthsAgo = navHistory.find(nav => {
            const threeMonths = new Date();
            threeMonths.setMonth(threeMonths.getMonth() - 3);
            return nav.date >= threeMonths;
          });
          const sixMonthsAgo = navHistory.find(nav => {
            const sixMonths = new Date();
            sixMonths.setMonth(sixMonths.getMonth() - 6);
            return nav.date >= sixMonths;
          });
          const oneYearAgo = navHistory.find(nav => {
            const oneYear = new Date();
            oneYear.setFullYear(oneYear.getFullYear() - 1);
            return nav.date >= oneYear;
          });

          const calculateReturn = (startNav: number, endNav: number) => {
            return ((endNav - startNav) / startNav) * 100;
          };

          return {
            schemeCode: fund.schemeCode,
            schemeName: fund.schemeName,
            fundHouse: fund.fundHouse,
            schemeType: fund.schemeType,
            schemeCategory: fund.schemeCategory,
            currentNAV: latestNav,
            returns: {
              oneMonth: oneMonthAgo ? calculateReturn(oneMonthAgo.nav, latestNav) : null,
              threeMonths: threeMonthsAgo ? calculateReturn(threeMonthsAgo.nav, latestNav) : null,
              sixMonths: sixMonthsAgo ? calculateReturn(sixMonthsAgo.nav, latestNav) : null,
              oneYear: oneYearAgo ? calculateReturn(oneYearAgo.nav, latestNav) : null
            },
            navHistory: navHistory.map(nav => ({
              date: nav.date.toISOString().split('T')[0],
              nav: nav.nav
            }))
          };
        } catch (error) {
          console.error(`Error processing fund ${schemeCode}:`, error);
          return null;
        }
      })
    );

    const validFunds = funds.filter(fund => fund !== null);

    if (validFunds.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Insufficient valid funds for comparison' },
        { status: 400 }
      );
    }

    // Calculate comparison metrics
    const comparison = {
      funds: validFunds,
      metrics: {
        bestPerformer: {
          oneMonth: validFunds.reduce((best, fund) => 
            (fund.returns.oneMonth || 0) > (best.returns.oneMonth || 0) ? fund : best
          ),
          threeMonths: validFunds.reduce((best, fund) => 
            (fund.returns.threeMonths || 0) > (best.returns.threeMonths || 0) ? fund : best
          ),
          sixMonths: validFunds.reduce((best, fund) => 
            (fund.returns.sixMonths || 0) > (best.returns.sixMonths || 0) ? fund : best
          ),
          oneYear: validFunds.reduce((best, fund) => 
            (fund.returns.oneYear || 0) > (best.returns.oneYear || 0) ? fund : best
          )
        },
        averageReturns: {
          oneMonth: validFunds.reduce((sum, fund) => sum + (fund.returns.oneMonth || 0), 0) / validFunds.length,
          threeMonths: validFunds.reduce((sum, fund) => sum + (fund.returns.threeMonths || 0), 0) / validFunds.length,
          sixMonths: validFunds.reduce((sum, fund) => sum + (fund.returns.sixMonths || 0), 0) / validFunds.length,
          oneYear: validFunds.reduce((sum, fund) => sum + (fund.returns.oneYear || 0), 0) / validFunds.length
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error comparing funds:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to compare funds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
