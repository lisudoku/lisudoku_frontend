import { faXmark, faArrowLeft, faCheck, faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Card, CardBody, Typography } from '@material-tailwind/react'
import useInterval from 'react-useinterval'
import Button from 'src/components/Button'
import SudokuDigitInput from 'src/components/Puzzle/SudokuDigitInput'
import { useDispatch, useSelector } from 'src/hooks'
import { updateTimer } from 'src/reducers/trainer'
import { TrainerTechniqueDisplay } from 'src/utils/constants'
import { formatTimer } from 'src/utils/sudoku'
import { useTrainerControls } from './hooks'

const ShowingSolutions = () => (
  <Typography variant="h6" className="mt-2">
    <FontAwesomeIcon icon={faArrowLeft} className="hidden md:inline-block" />
    <FontAwesomeIcon icon={faArrowUp} className="inline-block md:hidden" />
    {' '}
    Showing solutions
  </Typography>
)

const TrainerControls = () => {
  const dispatch = useDispatch()
  const technique = useSelector(state => state.trainer.technique)
  const gridSize = useSelector(state => state.trainer.data?.constraints.gridSize)
  const finished = useSelector(state => state.trainer.finished)
  const success = useSelector(state => state.trainer.success)
  const abandoned = useSelector(state => state.trainer.abandoned)
  const solveTimer = useSelector(state => state.trainer.solveTimer)

  useInterval(() => {
    if (!finished) {
      dispatch(updateTimer())
    }
  }, 1000)

  const { onSelectedCellValueChange, onViewSolutions, onNextPuzzle } = useTrainerControls()

  if (!gridSize || !onSelectedCellValueChange) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 md:gap-4 w-full md:w-64">
      <div className="mt-2 md:mt-0">
        <SudokuDigitInput
          gridSize={gridSize}
          onClick={onSelectedCellValueChange}
        />
      </div>
      <Card className="rounded w-full bg-gray-900 text-white">
        <CardBody>
          {!finished ? (
            <>
              <Typography variant="h5">
                Find a digit
              </Typography>
              <Typography variant="small">
                {TrainerTechniqueDisplay[technique]}
              </Typography>
              <Button variant="text" color="gray" className="w-fit mt-4 p-0" onClick={onViewSolutions}>
                View solutions
              </Button>
            </>
          ) : abandoned ? (
            <>
              <Typography variant="h6">
                You gave up
                {' '}
                <FontAwesomeIcon icon={faXmark} size="lg" color="red" />
              </Typography>
              <Typography variant="small">
                Don't worry, you'll get it next time!
              </Typography>
              <ShowingSolutions />
            </>
          ) : success ? (
            <>
              <Typography variant="h6">
                Correct!
                {' '}
                <FontAwesomeIcon icon={faCheck} size="lg" color="green" />
              </Typography>
              <div className="mt-2">
                Solved in {formatTimer(solveTimer)}
                <span className="ml-2 absolute animate-expand">
                  {solveTimer <= 5 ? '😱' : solveTimer <= 15 ? '🚀' : '🎉'}
                </span>
              </div>
            </>
          ) : (
            <>
              <Typography variant="h6">
                Incorrect!
                {' '}
                <FontAwesomeIcon icon={faXmark} size="lg" color="red" />
              </Typography>
              <Typography variant="small">
                That digit is either incorrect or not using the Naked Single technique!
              </Typography>
              <ShowingSolutions />
            </>
          )}
        </CardBody>
      </Card>
      <div className="mt-2 md:mt-0">
        <Button
          color={finished ? 'green' : 'gray'}
          variant="filled"
          onClick={onNextPuzzle}
          className="w-full"
        >
          Next puzzle
        </Button>
      </div>
    </div>
  )
}

export default TrainerControls
