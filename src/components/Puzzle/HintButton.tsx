import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Button from '../../design_system/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { logicalHint } from 'src/utils/wasm'
import { combineConstraintsWithGrid } from 'src/utils/solver'
import { changeHintSolution, changePaused } from 'src/reducers/puzzle'
import Tooltip from '../../design_system/Tooltip'

const HINT_DISABLED_TOOLTIP = <div className="w-48">
  You should spend at least 1 minute to figure it out yourself before requesting hints.
</div>

const HINT_THRESHOLD = 60
const LONG_THINK_THRESHOLD = 3 * 60

const HintButton = () => {
  const dispatch = useDispatch()
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const grid = useSelector(state => state.puzzle.grid!)
  const lastHintTimer = useSelector(state => state.puzzle.controls.lastHintTimer)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const lastUpdateTimer = useSelector(state => state.puzzle.lastUpdateTimer)
  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)

  const disabled = hintLevel === null && lastHintTimer !== null && solveTimer - lastHintTimer < HINT_THRESHOLD
  const longThink = lastUpdateTimer && solveTimer - lastUpdateTimer >= LONG_THINK_THRESHOLD;

  const handleClick = useCallback(() => {
    if (constraints === undefined) {
      return
    }
    if (!disabled) {
      const fullConstraints = combineConstraintsWithGrid(constraints, grid)
      const solution = logicalHint(fullConstraints)
      dispatch(changeHintSolution(solution))
    }
    setTimeout(() => dispatch(changePaused(false)), 1)
  }, [dispatch, constraints, grid, disabled])

  return (
    <Tooltip
      content={disabled ? HINT_DISABLED_TOOLTIP : null}
      placement="bottom"
    >
      <div>
        <Button variant={disabled ? 'text' : 'filled'}
                color={(!disabled && longThink) ? 'light-green' : 'gray'}
                className="w-full mt-2 md:mt-1"
                onClick={handleClick}
                disabled={solved || disabled}
        >
          <FontAwesomeIcon icon={faLightbulb} />
          {` ${hintLevel === null ? 'Small' : 'Big'} hint`}
        </Button>
      </div>
    </Tooltip>
  )
}

export default HintButton
