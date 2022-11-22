import SudokuRules from './SudokuRules'
import ShortcutsButton from './ShortcutsButton'
import PermalinkButton from './PermalinkButton'
import VariantSelect from './VariantSelect'
import DifficultySelect from './DifficultySelect'
import { SudokuConstraints } from 'src/types/sudoku'

const SudokuMisc = ({ constraints }: { constraints: SudokuConstraints }) => (
  <div className="flex flex-col max-w-xs">
    <div className="mb-3">
      <SudokuRules constraints={constraints} />
    </div>
    <div className="mt-2 ml-6 w-fit">
      <VariantSelect />
    </div>
    <div className="mt-2 ml-6 w-fit">
      <DifficultySelect />
    </div>
    <PermalinkButton />
    <ShortcutsButton />
  </div>
)

export default SudokuMisc
