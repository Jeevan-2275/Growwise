import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export class PortfolioRepository {
  async findByUserId(userId: string) {
    try {
      return await prisma.portfolio.findMany({
        where: { userId },
        include: {
          holdings: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      logger.error('Failed to find portfolios by user ID', { userId, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to find portfolios')
    }
  }

  async findById(id: string) {
    try {
      return await prisma.portfolio.findUnique({
        where: { id },
        include: {
          holdings: true
        }
      })
    } catch (error) {
      logger.error('Failed to find portfolio by ID', { id, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to find portfolio')
    }
  }

  async create(data: {
    userId: string
    name: string
    description?: string
  }) {
    try {
      return await prisma.portfolio.create({
        data,
        include: {
          holdings: true
        }
      })
    } catch (error) {
      logger.error('Failed to create portfolio', { data, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to create portfolio')
    }
  }

  async update(id: string, data: {
    name?: string
    description?: string
  }) {
    try {
      return await prisma.portfolio.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          holdings: true
        }
      })
    } catch (error) {
      logger.error('Failed to update portfolio', { id, data, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to update portfolio')
    }
  }

  async delete(id: string) {
    try {
      return await prisma.portfolio.delete({
        where: { id }
      })
    } catch (error) {
      logger.error('Failed to delete portfolio', { id, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to delete portfolio')
    }
  }

  async addHolding(portfolioId: string, data: {
    schemeCode: string
    schemeName: string
    units: number
    averagePrice: number
  }) {
    try {
      return await prisma.holding.create({
        data: {
          portfolioId,
          ...data
        }
      })
    } catch (error) {
      logger.error('Failed to add holding', { portfolioId, data, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to add holding')
    }
  }

  async updateHolding(id: string, data: {
    units?: number
    averagePrice?: number
  }) {
    try {
      return await prisma.holding.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      logger.error('Failed to update holding', { id, data, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to update holding')
    }
  }

  async deleteHolding(id: string) {
    try {
      return await prisma.holding.delete({
        where: { id }
      })
    } catch (error) {
      logger.error('Failed to delete holding', { id, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to delete holding')
    }
  }
}

export const portfolioRepo = new PortfolioRepository()
