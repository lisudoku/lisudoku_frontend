import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Alert from '../../design_system/Alert'
import Tooltip from '../../design_system/Tooltip'
import Typography from '../../design_system/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons'
import { changeHintLevel, changeHintSolution, HintLevel } from 'src/reducers/puzzle'
import { combineConstraintsWithGrid, computeHintContent } from 'src/utils/solver'
import { scrollToTop } from 'src/utils/misc'
import { sendHbAlert } from 'src/components/HoneybadgerProvider'
import { exportToLisudokuPuzzle, exportToLisudokuSolver } from 'src/utils/import'

const useComputeHintElement = () => {
  const dispatch = useDispatch()

  const solution = useSelector(state => state.puzzle.controls.hintSolution)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const cellMarks = useSelector(state => state.puzzle.cellMarks!)
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const isExternal = useSelector(state => !!state.puzzle.data?.isExternal)
  const publicId = useSelector(state => state.puzzle.data?.publicId)
  const grid = useSelector(state => state.puzzle.grid)
  const actions = useSelector(state => state.puzzle.controls.actions)

  const handleBigHintClick = useCallback(() => {
    dispatch(changeHintLevel(HintLevel.Big))
  }, [dispatch])

  const [ hintMessage, filteredSteps, hintError ] = useMemo(
    () => constraints === undefined ? [] : computeHintContent(
      solution, hintLevel!, cellMarks, constraints, isExternal
    ),
    [solution, hintLevel, cellMarks, constraints, isExternal]
  )

  const context = useMemo(() => ({
    isExternal,
    publicId,
    puzzle_url: constraints ? exportToLisudokuSolver(constraints) : undefined,
    puzzle_state_url: constraints && grid ? exportToLisudokuPuzzle(
      combineConstraintsWithGrid(constraints, grid)
    ) : undefined,
    solution_type: solution?.solutionType,
  }), [isExternal, publicId, grid, constraints, solution])

  const isAtPuzzleBeginning = actions.length <= 1
  useEffect(() => {
    if (!hintError || (!isAtPuzzleBeginning && context.solution_type !== 'Partial')) {
      return
    }
    sendHbAlert({
      name: isAtPuzzleBeginning ? 'No hint at puzzle beginning!' : 'No hint',
      context,
    })
  }, [hintError, context, isAtPuzzleBeginning])

  if (solution === null) {
    return <></>
  }

  return (
    <>
      <Typography variant="h3" className="pb-2 text-primary">
        {hintLevel !== null ? `${hintLevel} hint` : 'Hint'}{' '}
        {filteredSteps && !hintError && (
          <span className="relative top-[1px]">
            <Tooltip content="Some steps were removed assuming your pencil marks are correct" placement="bottom">
              <FontAwesomeIcon icon={faCircleExclamation} size="xs" color="yellow" />
            </Tooltip>
          </span>
        )}
      </Typography>
      <div className="antialiased font-sans text-sm font-light leading-normal text-primary">
        <span>{hintMessage}</span>
        {!hintError && (
          <>
            <p className="mt-3 pb-2 text-xs"><em>Click on each technique to learn how to apply them.</em></p>
            {hintLevel === HintLevel.Small && solution.solutionType !== 'None' && (
              <p className="text-xs">
                <em>
                  <span>Still confused? Check out the{' '}</span>
                  <span className="underline cursor-pointer" onClick={handleBigHintClick}>
                    big hint
                  </span>
                  .
                </em>
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}

const CloseButton = ({ onClick }: { onClick?: () => void }) => (
  <div onClick={onClick} className="w-1">
    <FontAwesomeIcon icon={faXmark} size="lg" className="absolute transform -translate-x-3 cursor-pointer text-primary" />
  </div>
)

const HintPanel = () => {
  const dispatch = useDispatch()
  const hintSolution = useSelector(state => state.puzzle.controls.hintSolution)

  const hintMessage = useComputeHintElement()
  const handleAlertClose = useCallback(() => {
    dispatch(changeHintSolution(null))
    scrollToTop()
  }, [dispatch])

  return (
    <Alert
      className="absolute h-full"
      open={!!hintSolution}
      onClose={handleAlertClose}
      action={<CloseButton onClick={handleAlertClose} />}
    >{hintMessage}</Alert>
  )
}

export default HintPanel
