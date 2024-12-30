export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause: unknown,
    public code?: string
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export const SearchType = {
  SIMPLE: 'SIMPLE',
  ADVANCED: 'ADVANCED',
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]
