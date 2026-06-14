import { describe, expect, it } from 'vitest'
import { paginateList, SYNTHESE_GOALS_PAGE_SIZE } from './paginateList'

describe('paginateList', () => {
  it('returns first page with up to page size items', () => {
    const result = paginateList(['a', 'b', 'c', 'd', 'e'], 1, SYNTHESE_GOALS_PAGE_SIZE)

    expect(result.items).toEqual(['a', 'b', 'c'])
    expect(result.currentPage).toBe(1)
    expect(result.totalPages).toBe(2)
    expect(result.hasPrevious).toBe(false)
    expect(result.hasNext).toBe(true)
    expect(result.startIndex).toBe(0)
  })

  it('returns second page items with correct global start index', () => {
    const result = paginateList(['a', 'b', 'c', 'd', 'e'], 2, SYNTHESE_GOALS_PAGE_SIZE)

    expect(result.items).toEqual(['d', 'e'])
    expect(result.currentPage).toBe(2)
    expect(result.hasPrevious).toBe(true)
    expect(result.hasNext).toBe(false)
    expect(result.startIndex).toBe(3)
  })

  it('clamps invalid page numbers', () => {
    expect(paginateList(['a', 'b'], 0, 3).currentPage).toBe(1)
    expect(paginateList(['a', 'b'], 9, 3).currentPage).toBe(1)
    expect(paginateList(['a', 'b', 'c', 'd'], 99, 3).currentPage).toBe(2)
  })
})
