import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResponse } from '@/lib/gemini';

export async function GET(
  request: NextRequest,
  { params }: { params: { schemecode: string } }
) {
  try {
    const { schemecode } = params;
    
    if (!schemecode || isNaN(Number(schemecode))) {
      return NextResponse.json(
        { success: false, error: 'Invalid scheme code' },
        { status: 400 }
      );
    }

    // Check if we have a cached description
    const fund = await prisma.fund.findUnique({
      where: { schemeCode: schemecode },
      select: {
        id: true,
        schemeName: true,
        fundHouse: true,
        schemeType: true,
        schemeCategory: true,
        aiDescription: true,
        lastUpdated: true
      }
    });

    if (!fund) {
      return NextResponse.json(
        { success: false, error: 'Fund not found' },
        { status: 404 }
      );
    }

    // If we have a recent AI description (less than 7 days old), return it
    if (fund.aiDescription && fund.lastUpdated) {
      const daysSinceUpdate = (Date.now() - fund.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) {
        return NextResponse.json({
          success: true,
          data: {
            description: fund.aiDescription,
            cached: true,
            lastUpdated: fund.lastUpdated.toISOString()
          }
        });
      }
    }

    // Generate new AI description
    const prompt = `Generate a comprehensive, professional description for the mutual fund "${fund.schemeName}" from ${fund.fundHouse}. 

Fund Details:
- Scheme Name: ${fund.schemeName}
- Fund House: ${fund.fundHouse}
- Scheme Type: ${fund.schemeType}
- Scheme Category: ${fund.schemeCategory}

Please provide:
1. A brief overview of the fund's investment objective
2. The fund's investment strategy and approach
3. Target investor profile and risk level
4. Key benefits and potential returns
5. Any notable features or characteristics

Keep the description informative, professional, and suitable for retail investors. Use clear, accessible language. Limit to 300-400 words.`;

    try {
      const aiDescription = await generateResponse(prompt);
      
      // Update fund with new AI description
      await prisma.fund.update({
        where: { schemeCode: schemecode },
        data: {
          aiDescription: aiDescription,
          lastUpdated: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          description: aiDescription,
          cached: false,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Return a fallback description if AI fails
      const fallbackDescription = `${fund.schemeName} is a ${fund.schemeType.toLowerCase()} mutual fund from ${fund.fundHouse}. It falls under the ${fund.schemeCategory.toLowerCase()} category and is designed for investors looking for ${fund.schemeType === 'Equity' ? 'long-term capital appreciation through equity investments' : fund.schemeType === 'Debt' ? 'stable returns through fixed income securities' : 'balanced growth through a mix of equity and debt instruments'}. This fund aims to provide ${fund.schemeType === 'Equity' ? 'capital appreciation' : fund.schemeType === 'Debt' ? 'regular income' : 'balanced returns'} while managing risk through professional fund management.`;

      return NextResponse.json({
        success: true,
        data: {
          description: fallbackDescription,
          cached: false,
          fallback: true,
          lastUpdated: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error generating fund description:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate fund description',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
