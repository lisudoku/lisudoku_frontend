import { formatISO9075, parseISO } from 'date-fns/esm'
import { ActionType, UserSolution } from 'src/types'
import { formatTimer } from 'src/utils/sudoku'
import { HistoryStep } from './useGridHistory'

interface SolveStatsProps {
  userSolution: UserSolution
  currentStepIndex: number
  historyStep: HistoryStep
}

const SolveStats = ({ userSolution, currentStepIndex, historyStep }: SolveStatsProps) => (
  <div className="pt-3 pl-3">
    <div>
      <b>Solved at:</b> {userSolution.createdAt ? formatISO9075(parseISO(userSolution.createdAt)) : '-'}
    </div>
    {userSolution.steps !== undefined && (
      <div>
        <b>Total steps:</b> {userSolution.steps.length}
      </div>
    )}
    {userSolution.solveTime && (
      <div>
        <b>Total time:</b> {formatTimer(userSolution.solveTime)}
      </div>
    )}
    {userSolution.steps !== undefined && (
      <div>
        <b>Time to first digit:</b> {formatTimer(userSolution.steps.find(step => step.type === ActionType.Digit)!.time)}
      </div>
    )}
    <div>
      <b>Current step time:</b> {formatTimer(historyStep.time)}
      {currentStepIndex > 0 && ` (+${historyStep.timeDiff}s)`}
    </div>
  </div>
)

export default SolveStats
