import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import SudokuRules from './SudokuRules'
import ShortcutsButton from './ShortcutsButton'
import PermalinkButton from './PermalinkButton'
import VariantSelect from './VariantSelect'
import DifficultySelect from './DifficultySelect'

const SudokuMisc = () => {
  const navigate = useNavigate()

  const publicId = useSelector(state => state.puzzle.data!.publicId!)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const variant = useSelector(state => state.puzzle.data!.variant)
  const difficulty = useSelector(state => state.userData.difficulty)

  const onVariantChange = useCallback((variant: SudokuVariant) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, difficulty])
  const onDifficultyChange = useCallback((difficulty: SudokuDifficulty) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, variant])

  return (
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
      <PermalinkButton publicId={publicId} />
      <ShortcutsButton />
    </div>
  )
}

export default SudokuMisc
