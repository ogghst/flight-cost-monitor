'use server'

import { auth } from '@/lib/auth'
import { userRepository, userSearchRepository } from '@fcm/storage/repositories'
import { SearchType } from '@fcm/storage/schema'

export async function saveSearch(searchData: {
  searchType: (typeof SearchType)[keyof typeof SearchType]
  criteria: any
  title?: string
}) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  const user = await userRepository.findByEmail(session.user.email)
  if (!user) {
    throw new Error('User not found')
  }

  return userSearchRepository.create({
    userId: user.id,
    searchType: searchData.searchType,
    criteria: JSON.stringify(searchData.criteria),
    title: searchData.title,
    favorite: false,
    lastUsed: new Date(),
  })
}

export async function getUserSearches(
  searchType?: (typeof SearchType)[keyof typeof SearchType]
) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  const user = await userRepository.findByEmail(session.user.email)
  if (!user) {
    throw new Error('User not found')
  }

  const searches = await userSearchRepository.findByUser(user.id, searchType)
  return searches.map((search) => ({
    ...search,
    criteria: JSON.parse(search.criteria),
  }))
}

export async function getFavoriteSearches() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  const user = await userRepository.findByEmail(session.user.email)
  if (!user) {
    throw new Error('User not found')
  }

  const searches = await userSearchRepository.findFavorites(user.id)
  return searches.map((search) => ({
    ...search,
    criteria: JSON.parse(search.criteria),
  }))
}

export async function markSearchUsed(searchId: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  const user = await userRepository.findByEmail(session.user.email)
  if (!user) {
    throw new Error('User not found')
  }

  const search = await userSearchRepository.findById(searchId)
  if (!search || search.userId !== user.id) {
    throw new Error('Search not found or unauthorized')
  }

  return userSearchRepository.updateLastUsed(searchId)
}
