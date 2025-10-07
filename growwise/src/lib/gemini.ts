import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from './env'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
})

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate AI response')
  }
}

export async function* generateStreamResponse(prompt: string): AsyncGenerator<string, void, unknown> {
  try {
    const result = await geminiModel.generateContentStream(prompt)
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      if (chunkText) {
        yield chunkText
      }
    }
  } catch (error) {
    console.error('Gemini streaming error:', error)
    throw new Error('Failed to generate streaming AI response')
  }
}
