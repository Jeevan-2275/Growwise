import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters')

// Calculator schemas
export const sipCalculatorSchema = z.object({
  monthlyAmount: z.number().positive('Monthly amount must be positive'),
  investmentPeriod: z.number().positive('Investment period must be positive'),
  expectedReturn: z.number().positive('Expected return must be positive'),
  schemeCode: z.string().optional(),
})

export const lumpsumCalculatorSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  investmentPeriod: z.number().positive('Investment period must be positive'),
  expectedReturn: z.number().positive('Expected return must be positive'),
  schemeCode: z.string().optional(),
})

export const swpCalculatorSchema = z.object({
  corpus: z.number().positive('Corpus must be positive'),
  monthlyWithdrawal: z.number().positive('Monthly withdrawal must be positive'),
  expectedReturn: z.number().positive('Expected return must be positive'),
  schemeCode: z.string().optional(),
})

export const rollingReturnsSchema = z.object({
  schemeCode: z.string().min(1, 'Scheme code is required'),
  period: z.number().positive('Period must be positive'),
  frequency: z.enum(['daily', 'monthly', 'yearly']).default('monthly'),
})

// Portfolio schemas
export const portfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required'),
  description: z.string().optional(),
})

export const holdingSchema = z.object({
  schemeCode: z.string().min(1, 'Scheme code is required'),
  schemeName: z.string().min(1, 'Scheme name is required'),
  units: z.number().positive('Units must be positive'),
  averagePrice: z.number().positive('Average price must be positive'),
})

// API response schemas
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })

// Type exports
export type SIPCalculatorInput = z.infer<typeof sipCalculatorSchema>
export type LumpsumCalculatorInput = z.infer<typeof lumpsumCalculatorSchema>
export type SWPCalculatorInput = z.infer<typeof swpCalculatorSchema>
export type RollingReturnsInput = z.infer<typeof rollingReturnsSchema>
export type PortfolioInput = z.infer<typeof portfolioSchema>
export type HoldingInput = z.infer<typeof holdingSchema>
