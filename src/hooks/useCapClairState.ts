import { useContext } from 'react'
import { CapClairContext } from './capclairContext'

export function useCapClairState() {
  const context = useContext(CapClairContext)
  if (!context) {
    throw new Error('useCapClairState must be used inside CapClairProvider')
  }
  return context
}
