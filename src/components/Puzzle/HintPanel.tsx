import { Typography } from '@material-tailwind/react'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Alert from '../Alert'
import { changeHintLevel, changeHintSolution, HintLevel } from 'src/reducers/puzzle'
import { SolutionType, SudokuIntuitiveSolveResult } from 'src/types/wasm'
import { computeHintMessage } from 'src/utils/solver'

const useComputeHintElement = (solution: SudokuIntuitiveSolveResult | null, hintLevel: HintLevel | null) => {
  const dispatch = useDispatch()

  const notes = useSelector(state => state.puzzle.notes!)

  const handleBigHintClick = useCallback(() => {
    dispatch(changeHintLevel(HintLevel.Big))
  }, [dispatch])

  const message = useMemo(
    () => computeHintMessage(solution, hintLevel!, notes),
    [solution, hintLevel, notes]
  )

  if (solution === null) {
    return <></>
  }

  return (
    <>
      <Typography variant="h3" className="pb-2">
        {hintLevel} hint
      </Typography>
      <div className="antialiased font-sans text-sm font-light leading-normal">
        {message}
        {hintLevel === HintLevel.Small && solution.solution_type !== SolutionType.None && (
          <p className="mt-3 text-xs"><em>Still confused? Check out the
            {' '}
            <span className="underline cursor-pointer" onClick={handleBigHintClick}>
              big hint
            </span>
          .</em></p>
        )}
      </div>
    </>
  )
}

const HintPanel = () => {
  const dispatch = useDispatch()
  const hintSolution = useSelector(state => state.puzzle.controls.hintSolution)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)

  const hintMessage = useComputeHintElement(hintSolution, hintLevel)
  const handleAlertClose = useCallback(() => dispatch(changeHintSolution(null)), [dispatch])

  return (
    <Alert
      show={!!hintSolution}
      onClose={handleAlertClose}
    >{hintMessage}</Alert>
  )
}

export default HintPanel
