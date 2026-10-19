import type { BruteSolverState, LogicalSolverState } from 'src/reducers/builder'
import SolutionPanel from './SolutionPanel'

interface SolutionPanelActionPanelProps {
  solverType: 'logical' | 'brute'
  solverState: BruteSolverState | LogicalSolverState
  onRun: () => void
  onClear: () => void
  onStop: () => void
}

export const SolutionPanelActionPanel = ({ solverType, solverState, onRun, onClear, onStop }: SolutionPanelActionPanelProps) => (
  <>
    {(solverState.status === 'ok' || solverState.status === 'error') && solverState.solution === undefined ? (
      <SolutionPanel.Button
        onClick={onRun}
        aria-label={solverType === 'brute' ? 'Run brute solver' : 'Run logical solver'}
      >
        Run
      </SolutionPanel.Button>
    ) : solverState.status === 'ok' && solverState.solution !== undefined ? (
      <SolutionPanel.ClearButton onClick={onClear} />
    ) : solverState.status === 'running' && (
      <SolutionPanel.Button
        onClick={onStop}
        aria-label={solverType === 'brute' ? 'Stop brute solver' : 'Stop logical solver'}
      >
        Stop
      </SolutionPanel.Button>
    )}
  </>
)
