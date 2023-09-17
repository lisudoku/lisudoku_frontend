import { SudokuBruteSolveResult } from 'src/types/wasm'
import SolutionPanel from './SolutionPanel'

const BruteSolutionPanel = ({ running, solution, onClear }: BruteSolutionPanelProps) => (
  <SolutionPanel className="h-10" onClear={solution !== null ? onClear : undefined}>
    {running ? (
      'Running...'
    ) : solution === null ? (
      ''
    ) : solution.solution_count === 0 ? (
      'No solutions 🙁'
    ) : solution.solution_count === 2 ? (
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
