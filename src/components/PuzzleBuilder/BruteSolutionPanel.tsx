import SolutionPanel from './SolutionPanel'
import type { BruteSolverState } from 'src/reducers/builder'
import { useFormattedElapsedTime } from './hooks'
import { SolutionPanelActionPanel } from './SolutionPanelActionPanel'

interface BruteSolutionPanelProps {
  solverState: BruteSolverState
  onRun: () => void
  onStop: () => void
  onClear: () => void
}

export const BruteSolutionPanel = ({ solverState, onRun, onStop, onClear }: BruteSolutionPanelProps) => {
  const elapsedTimeMs = useFormattedElapsedTime(solverState.runStartedAt)

  return (
    <SolutionPanel>
      <SolutionPanel.Header>
        <div>
          Brute-Force Solver
        </div>
        <SolutionPanelActionPanel
          solverState={solverState}
          onRun={onRun}
          onClear={onClear}
          onStop={onStop}
        />
      </SolutionPanel.Header>
      <SolutionPanel.Body>
        {solverState.status === 'running' ? (
          'Running... ' + elapsedTimeMs
        ) : solverState.status === 'error' ? (
          solverState.error
        ) : solverState.solution === undefined ? (
          ''
        ) : solverState.solution.solutionCount === 0 ? (
          'No solutions 🙁'
        ) : solverState.solution.solutionCount === 2 ? (
          'Multiple solutions 😢'
        ) : (
          'Unique solution 🎉'
        )}
      </SolutionPanel.Body>
    </SolutionPanel>
  )
}
