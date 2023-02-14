import { Typography, Tooltip } from '@material-tailwind/react'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Alert from '../Alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { changeHintLevel, changeHintSolution, HintLevel } from 'src/reducers/puzzle'
import { SolutionType, SudokuIntuitiveSolveResult } from 'src/types/wasm'
import { computeHintContent } from 'src/utils/solver'

const useComputeHintElement = (solution: SudokuIntuitiveSolveResult | null, hintLevel: HintLevel | null) => {
  const dispatch = useDispatch()

  const notes = useSelector(state => state.puzzle.notes!)

  const handleBigHintClick = useCallback(() => {
    dispatch(changeHintLevel(HintLevel.Big))
  }, [dispatch])

  const [ message, filteredSteps ] = useMemo(
    () => computeHintContent(solution, hintLevel!, notes),
    [solution, hintLevel, notes]
  )

  if (solution === null) {
    return <></>
  }

  return (
    <>
      <Typography variant="h3" className="pb-2">
        {hintLevel} hint {' '}
        {filteredSteps && (
          <span className="relative top-[1px]">
            <Tooltip content="Some steps were removed assuming your pencil marks are correct" placement="bottom">
              <FontAwesomeIcon icon={faCircleExclamation} size="xs" color="yellow" />
            </Tooltip>
          </span>
        )}
      </Typography>
      <div className="antialiased font-sans text-sm font-light leading-normal">
        {message}
        <p className="mt-3 text-xs"><em>Click on each technique to learn how to apply them.</em></p>
        {hintLevel === HintLevel.Small && solution.solution_type !== SolutionType.None && (
          <p className="mt-1 text-xs">
            <em>
              Still confused? Check out the
              {' '}
              <span className="underline cursor-pointer" onClick={handleBigHintClick}>
                big hint
              </span>
              .
            </em>
          </p>
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
