import SudokuRules from './SudokuRules'
import ShortcutsButton from './ShortcutsButton'
import PermalinkButton from './PermalinkButton'
import VariantSelect from './VariantSelect'
import DifficultySelect from './DifficultySelect'
import { SudokuConstraints, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

const SudokuMisc = ({ constraints, variant, difficulty, onVariantChange, onDifficultyChange }: SudokuMiscProps) => (
  <div className="flex flex-col max-w-xs">
    <div className="mb-3">
      <SudokuRules constraints={constraints} />
    </div>
    <div className="mt-2 ml-6 w-fit">
      <VariantSelect value={variant} onChange={onVariantChange} />
    </div>
    <div className="mt-2 ml-6 w-fit">
      <DifficultySelect value={difficulty} onChange={onDifficultyChange} />
    </div>
    <PermalinkButton />
    <ShortcutsButton />
  </div>
)

type SudokuMiscProps = {
  constraints: SudokuConstraints,
  variant: SudokuVariant,
  difficulty: SudokuDifficulty,
  onVariantChange: Function,
  onDifficultyChange: Function,
}

export default SudokuMisc
