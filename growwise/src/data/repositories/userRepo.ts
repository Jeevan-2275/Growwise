import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export class UserRepository {
  async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          portfolios: {
            include: {
              holdings: true
            }
          }
        }
      })
    } catch (error) {
      logger.error('Failed to find user by ID', { id, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to find user')
    }
  }

  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email }
      })
    } catch (error) {
      logger.error('Failed to find user by email', { email, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to find user')
    }
  }

  async create(data: {
    email: string
    name?: string
    image?: string
    password?: string
  }) {
    try {
      return await prisma.user.create({
        data
      })
    } catch (error) {
      logger.error('Failed to create user', { data, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to create user')
    }
  }

  async update(id: string, data: {
    name?: string
    image?: string
  }) {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      logger.error('Failed to update user', { id, data, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to update user')
    }
  }

  async delete(id: string) {
    try {
      return await prisma.user.delete({
        where: { id }
      })
    } catch (error) {
      logger.error('Failed to delete user', { id, error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Failed to delete user')
    }
  }
}

export const userRepo = new UserRepository()
