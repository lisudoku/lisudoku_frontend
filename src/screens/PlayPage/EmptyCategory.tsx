import { Typography } from '@material-tailwind/react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DifficultySelect from 'src/components/Puzzle/DifficultySelect'
import VariantSelect from 'src/components/Puzzle/VariantSelect'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

const EmptyCategory = ({ variant, difficulty }: { variant: SudokuVariant, difficulty: SudokuDifficulty }) => {
  const navigate = useNavigate()

  const onVariantChange = useCallback((variant: SudokuVariant) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, difficulty])
  const onDifficultyChange = useCallback((difficulty: SudokuDifficulty) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, variant])

  return (
    <div className="flex flex-col gap-5 py-4 px-6">
      <Typography variant="paragraph">
        There are no unsolved puzzles here. You can select other variants or difficulties.
      </Typography>
      <div className="w-full md:w-32">
        <VariantSelect value={variant} onChange={onVariantChange} />
      </div>
      <div className="w-full md:w-32">
        <DifficultySelect value={difficulty} onChange={onDifficultyChange} />
      </div>
    </div>
  )
}

export default EmptyCategory
