import { SudokuBruteSolveResult } from 'lisudoku-solver'
import SolutionPanel from './SolutionPanel'

interface BruteSolutionPanelProps {
  running: boolean
  solution: SudokuBruteSolveResult | null
  onClear: () => void
}

export const BruteSolutionPanel = ({ running, solution, onClear }: BruteSolutionPanelProps) => (
  <SolutionPanel>
    <SolutionPanel.Body>
      {running ? (
        'Running...'
      ) : solution === null ? (
        ''
      ) : solution.solutionCount === 0 ? (
        'No solutions 🙁'
      ) : solution.solutionCount === 2 ? (
        'Multiple solutions 😢'
      ) : (
        'Unique solution 🎉'
      )}
    </SolutionPanel.Body>
    {solution !== null && (
      <SolutionPanel.Footer className="h-[30px]">
        <SolutionPanel.ClearButton onClick={onClear} />
      </SolutionPanel.Footer>
    )}
  </SolutionPanel>
)
