import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Alert from '../../shared/Alert'
import Tooltip from '../../shared/Tooltip'
import Typography from '../../shared/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons'
import { changeHintLevel, changeHintSolution, HintLevel } from 'src/reducers/puzzle'
import { SolutionType } from 'src/types/wasm'
import { computeHintContent } from 'src/utils/solver'
import { scrollToTop } from 'src/utils/misc'

const useComputeHintElement = () => {
  const dispatch = useDispatch()

  const solution = useSelector(state => state.puzzle.controls.hintSolution)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const cellMarks = useSelector(state => state.puzzle.cellMarks!)
  const isExternal = useSelector(state => !!state.puzzle.data?.isExternal)
  const gridSize = useSelector(state => state.puzzle.data!.constraints.gridSize)

  const handleBigHintClick = useCallback(() => {
    dispatch(changeHintLevel(HintLevel.Big))
  }, [dispatch])

  const [ message, filteredSteps, error ] = useMemo(
    () => computeHintContent(solution, hintLevel!, cellMarks, isExternal, gridSize),
    [solution, hintLevel, cellMarks, isExternal, gridSize]
  )

  if (solution === null) {
    return <></>
  }

  return (
    <>
      <Typography variant="h3" className="pb-2 text-primary">
        {hintLevel} hint {' '}
        {filteredSteps && !error && (
          <span className="relative top-[1px]">
            <Tooltip content="Some steps were removed assuming your pencil marks are correct" placement="bottom">
              <FontAwesomeIcon icon={faCircleExclamation} size="xs" color="yellow" />
            </Tooltip>
          </span>
        )}
      </Typography>
      <div className="antialiased font-sans text-sm font-light leading-normal text-primary">
        {message}
        {!error && (
          <>
            <p className="mt-3 pb-2 text-xs"><em>Click on each technique to learn how to apply them.</em></p>
            {hintLevel === HintLevel.Small && solution.solution_type !== SolutionType.None && (
              <p className="text-xs">
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
