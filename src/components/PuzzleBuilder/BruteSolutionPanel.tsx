import SolutionPanel from './SolutionPanel'
import type { BruteSolverState } from 'src/reducers/builder'

interface BruteSolutionPanelProps {
  solverState: BruteSolverState
  onClear: () => void
}

export const BruteSolutionPanel = ({ solverState, onClear }: BruteSolutionPanelProps) => (
  <SolutionPanel>
    <SolutionPanel.Body>
      {solverState.status === 'running' ? (
        'Running...'
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
    {solverState.solution !== undefined && (
      <SolutionPanel.Footer className="h-[30px]">
        <SolutionPanel.ClearButton onClick={onClear} />
      </SolutionPanel.Footer>
    )}
  </SolutionPanel>
)
