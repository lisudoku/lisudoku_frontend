import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'
import { SolveTimer } from './SolveTimer'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

interface PuzzleHeaderProps {
  variant: SudokuVariant
  difficulty: SudokuDifficulty
}

export const PuzzleHeader = ({ variant, difficulty }: PuzzleHeaderProps) => (
  <div className="md:hidden pb-1 flex justify-between">
    <div>
      {`${SudokuVariantDisplay[variant]} - ${SudokuDifficultyDisplay[difficulty]}`}
    </div>
    <div>
      <SolveTimer />
    </div>
  </div>
)
