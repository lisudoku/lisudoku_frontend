import { SudokuBruteSolveResult } from 'src/types/wasm'
import Alert from '../Alert'

const computeBruteSolutionDescription = (running: boolean, solution: SudokuBruteSolveResult | null) => {
  if (running) {
    return 'Running...'
  }
  if (solution === null) {
    return ''
  }
  if (solution.solution_count === 0) {
    return 'No solutions 🙁'
  } else if (solution.solution_count === 2) {
    return 'Multiple solutions 😢'
  } else {
    return 'Unique solution 🎉'
  }
}

const BruteSolutionPanel = ({ running, solution }: BruteSolutionPanelProps) => {
  return (
    <Alert show className="rounded py-2 h-10">
      {computeBruteSolutionDescription(running, solution)}
    </Alert>
  )
}

type BruteSolutionPanelProps = {
  running: boolean
  solution: SudokuBruteSolveResult | null
}

export default BruteSolutionPanel
