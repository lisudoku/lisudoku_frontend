import { SudokuBruteSolveResult } from 'lisudoku-solver'
import SolutionPanel from './SolutionPanel'

const BruteSolutionPanel = ({ running, solution, onClear }: BruteSolutionPanelProps) => (
  <SolutionPanel onClear={solution !== null ? onClear : undefined}>
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
  </SolutionPanel>
)

type BruteSolutionPanelProps = {
  running: boolean
  solution: SudokuBruteSolveResult | null
  onClear: () => void
}

export default BruteSolutionPanel
