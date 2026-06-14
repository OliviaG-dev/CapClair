export const SYNTHESE_GOALS_PAGE_SIZE = 3

export type PaginatedList<T> = {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  hasPrevious: boolean
  hasNext: boolean
  startIndex: number
}

export function paginateList<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedList<T> {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * pageSize

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    currentPage: safePage,
    totalPages,
    totalItems,
    hasPrevious: safePage > 1,
    hasNext: safePage < totalPages,
    startIndex,
  }
}
