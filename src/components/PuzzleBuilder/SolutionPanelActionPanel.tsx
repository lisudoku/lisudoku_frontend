import type { BruteSolverState, LogicalSolverState } from 'src/reducers/builder'
import SolutionPanel from './SolutionPanel'

interface SolutionPanelActionPanelProps {
  solverState: BruteSolverState | LogicalSolverState
  onRun: () => void
  onClear: () => void
  onStop: () => void
}

export const SolutionPanelActionPanel = ({ solverState, onRun, onClear, onStop }: SolutionPanelActionPanelProps) => (
  <>
    {(solverState.status === 'ok' || solverState.status === 'error') && solverState.solution === undefined ? (
      <SolutionPanel.Button
        onClick={onRun}
        aria-label="Run the solver"
      >
        Run
      </SolutionPanel.Button>
    ) : solverState.status === 'ok' && solverState.solution !== undefined ? (
      <SolutionPanel.ClearButton onClick={onClear} />
    ) : solverState.status === 'running' && (
      <SolutionPanel.Button
        onClick={onStop}
        aria-label="Stop the currently running solver"
      >
        Stop
      </SolutionPanel.Button>
    )}
  </>
)
