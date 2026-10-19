import SolutionPanel from './SolutionPanel'
import type { BruteSolverState } from 'src/reducers/builder'
import { SolutionPanelActionPanel } from './SolutionPanelActionPanel'
import { SolutionPanelSpinner } from './SolutionPanelSpinner'

interface BruteSolutionPanelProps {
  solverState: BruteSolverState
  onRun: () => void
  onStop: () => void
  onClear: () => void
}

export const BruteSolutionPanel = ({ solverState, onRun, onStop, onClear }: BruteSolutionPanelProps) => (
  <SolutionPanel>
    <SolutionPanel.Header>
      <div>
        Brute-Force Solver
      </div>
      <SolutionPanelActionPanel
        solverType="brute"
        solverState={solverState}
        onRun={onRun}
        onClear={onClear}
        onStop={onStop}
      />
    </SolutionPanel.Header>
    <SolutionPanel.Body>
      {solverState.status === 'running' ? (
        <SolutionPanelSpinner runStartedAt={solverState.runStartedAt} />
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
