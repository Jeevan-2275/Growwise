import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UpdateProfileData {
  name?: string
  image?: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return user
  } catch (error) {
    logger.error('Failed to get user profile', { userId, error: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Failed to fetch user profile')
  }
}

export async function updateUserProfile(
  userId: string, 
  data: UpdateProfileData
): Promise<UserProfile> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return user
  } catch (error) {
    logger.error('Failed to update user profile', { userId, data, error: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Failed to update user profile')
  }
}

export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id: userId }
    })
  } catch (error) {
    logger.error('Failed to delete user profile', { userId, error: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Failed to delete user profile')
  }
}
