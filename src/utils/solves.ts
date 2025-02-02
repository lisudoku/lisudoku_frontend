import { useEffect, useMemo, useState } from 'react'
import { compact, uniq } from 'lodash-es'
import { useSelector } from 'src/hooks'
import { UserSolution } from 'src/types'
import { Puzzle, SudokuVariant } from 'src/types/sudoku'
import { detectConstraints } from './sudoku'
import { CONSTRAINT_TYPE_VARIANTS, SudokuVariantDisplay } from './constants'
import { fetchUserSolution } from './apiService'
import { camelCaseKeys } from './json'

export const useSolve = (id: string) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [userSolution, setUserSolution] = useState<UserSolution>()
  const [puzzleConstraints, setPuzzleConstraints] = useState<Puzzle['constraints']>()
  const userToken = useSelector(state => state.userData!.token)

  const variantDisplay = useMemo(() => {
    if (puzzleConstraints === undefined) {
      return
    }
    const { constraintTypes, variant } = detectConstraints(puzzleConstraints)
    if (variant === SudokuVariant.Mixed) {
      return uniq(constraintTypes.map(
        constraintType => SudokuVariantDisplay[CONSTRAINT_TYPE_VARIANTS[constraintType]])
      ).join(', ')
    }
    return SudokuVariantDisplay[variant]
  }, [puzzleConstraints])

  useEffect(() => {
    setLoading(true)
    fetchUserSolution(id, userToken!).then(data => {
      const { userSolution, puzzleConstraints } = camelCaseKeys(data)
      setUserSolution(userSolution)
      setPuzzleConstraints(puzzleConstraints)
    }).catch((e) => {
      setError(e.message)
    }).finally(() => {
      setLoading(false)
    })
  }, [id, userToken])

  return {
    loading,
    error,
    userSolution,
    puzzleConstraints,
    variantDisplay,
  }
}

export const useSolvedPuzzleIds = () => {
  const solvedPuzzles = useSelector(state => state.userData.solvedPuzzles)

  const solvedPuzzleIds = useMemo(() => (
    compact(solvedPuzzles.map(({ puzzle }) => puzzle.publicId))
  ), [solvedPuzzles])

  return solvedPuzzleIds
}
