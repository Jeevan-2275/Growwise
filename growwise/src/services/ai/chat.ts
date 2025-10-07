import { generateResponse, generateStreamResponse } from '@/lib/gemini'
import { logger } from '@/lib/logger'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatContext {
  userId?: string
  sessionId?: string
  portfolioData?: any
}

export async function processChatMessage(
  message: string,
  context: ChatContext = {}
): Promise<string> {
  try {
    const systemPrompt = `You are a financial advisor AI assistant for Growwise, a mutual fund investment platform. 
    
    Your role is to:
    - Provide accurate information about mutual funds, SIP, lumpsum investments
    - Help users understand investment concepts
    - Assist with portfolio analysis and recommendations
    - Answer questions about market trends and fund performance
    
    Guidelines:
    - Always provide factual, up-to-date information
    - Be helpful but remind users to consult with financial advisors for major decisions
    - Keep responses concise and actionable
    - Use Indian financial context (INR, Indian mutual funds, etc.)
    
    User context: ${JSON.stringify(context)}
    
    User question: ${message}`

    const response = await generateResponse(systemPrompt)
    return response
  } catch (error) {
    logger.error('Chat processing failed', { 
      message, 
      context, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    throw new Error('Failed to process chat message')
  }
}

export async function* processChatStream(
  message: string,
  context: ChatContext = {}
): AsyncGenerator<string, void, unknown> {
  try {
    const systemPrompt = `You are a financial advisor AI assistant for Growwise, a mutual fund investment platform. 
    
    Your role is to:
    - Provide accurate information about mutual funds, SIP, lumpsum investments
    - Help users understand investment concepts
    - Assist with portfolio analysis and recommendations
    - Answer questions about market trends and fund performance
    
    Guidelines:
    - Always provide factual, up-to-date information
    - Be helpful but remind users to consult with financial advisors for major decisions
    - Keep responses concise and actionable
    - Use Indian financial context (INR, Indian mutual funds, etc.)
    
    User context: ${JSON.stringify(context)}
    
    User question: ${message}`

    yield* generateStreamResponse(systemPrompt)
  } catch (error) {
    logger.error('Chat streaming failed', { 
      message, 
      context, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    throw new Error('Failed to process chat stream')
  }
}
