import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { differenceInMinutes, parseISO } from 'date-fns'
import Button from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { intuitiveHint } from 'src/utils/wasm'
import { combineConstraintsWithGrid } from 'src/utils/solver'
import { changeHintSolution } from 'src/reducers/puzzle'

const HintButtons = () => {
  const dispatch = useDispatch()
  const constraints = useSelector(state => state.puzzle.data!.constraints!)
  const grid = useSelector(state => state.puzzle.grid!)
  const lastHint = useSelector(state => state.puzzle.controls.lastHint)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const solved = useSelector(state => state.puzzle.solved)

  const handleClick = useCallback(() => {
    if (hintLevel === null && lastHint !== null && differenceInMinutes(new Date(), parseISO(lastHint)) < 1) {
      alert('You should spend at least 1 minute to figure it out yourself before requesting more hints.')
      return
    }

    if (hintLevel !== null || window.confirm('Are you sure you tried to figure it out yourself?')) {
      const fullConstraints = combineConstraintsWithGrid(constraints, grid)
      const solution = intuitiveHint(fullConstraints)
      dispatch(changeHintSolution(solution))
    }
  }, [dispatch, constraints, grid, lastHint, hintLevel])

  return (
    <div className="flex">
      <Button variant="text"
              color="gray"
              className="w-full md:w-fit mt-2 md:mt-1"
              onClick={handleClick}
              disabled={solved}
      >
        <FontAwesomeIcon icon={faCircleQuestion} />
        {` ${hintLevel === null ? 'Small' : 'Big'} hint`}
      </Button>
    </div>
  )
}

export default HintButtons
