import { useEffect, useMemo } from 'react'
import { omit } from 'lodash-es'
import { useDispatch, useSelector } from 'src/hooks'
import { gridIsFull } from 'src/utils/sudoku'
import { honeybadger } from 'src/components/HoneybadgerProvider'
import { UserSolution } from 'src/types'
import { camelCaseKeys } from 'src/utils/json'
import { exportToLisudokuSolver } from 'src/utils/import'
import { checkSolved } from 'src/utils/wasm'
import { requestPuzzleCheck } from 'src/utils/apiService'
import { requestSolved, responseSolved } from 'src/reducers/puzzle'

export const useCheckSolvedState = (setIsSolvedLoading: (solved: boolean) => void) => {
  const dispatch = useDispatch()
  const actions = useSelector(state => state.puzzle.controls.actions)
  const isExternal = useSelector(state => state.puzzle.data?.isExternal)
  const id = useSelector(state => state.puzzle.data?.publicId!)
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const variant = useSelector(state => state.puzzle.data?.variant)
  const difficulty = useSelector(state => state.puzzle.data?.difficulty)
  const grid = useSelector(state => state.puzzle.grid)
  const solved = useSelector(state => state.puzzle.solved)

  const gridFull = useMemo(() => grid && gridIsFull(grid), [grid])

  useEffect(() => {
    if (constraints === undefined || solved !== null || !grid || !gridFull) {
      return
    }
    if (actions.length === 0) {
      // We might reach this state after solving a puzzle and requesting a new one
      // When requesting a new puzzle we clear actions
      return
    }

    setIsSolvedLoading(true)

    // Check locally if it's correct first
    const { solved: localSolved } = checkSolved(constraints, grid)
    if (!localSolved) {
      honeybadger.notify({
        name: 'Full grid unsolved',
        context: {
          id,
          url: exportToLisudokuSolver(constraints),
          grid,
        },
      })
      dispatch(responseSolved({
        solved: false,
      }))
      setIsSolvedLoading(false)
      return
    }

    // If external (custom) puzzle, no need to check with server
    if (isExternal) {
      dispatch(responseSolved({
        solved: true,
      }))
      setIsSolvedLoading(false)
      return
    }

    dispatch(requestSolved())
    const processedActions = actions.map(action => omit(action, ['previousDigits', 'previousCellMarks']))
    requestPuzzleCheck(id, grid, processedActions).then(result => {
      dispatch(responseSolved({
        userSolution: result.user_solution ? camelCaseKeys(result.user_solution) satisfies UserSolution : undefined,
        solved: result.correct,
        solveStats: result.stats,
      }))
      setIsSolvedLoading(false)
    })
  }, [
    dispatch, id, variant, difficulty, constraints, grid, gridFull,
    solved, setIsSolvedLoading, actions, isExternal,
  ])
}
