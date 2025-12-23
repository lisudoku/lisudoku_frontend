import { sample } from 'lodash-es'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DifficultySelect from 'src/components/Puzzle/DifficultySelect'
import VariantSelect from 'src/components/Puzzle/VariantSelect'
import Typography from 'src/design_system/Typography'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

const CONGRATS_MESSAGES = [
  'What a legend! 💪',
  'Good job! 🧠',
  'Heck yeah! 🔥',
  "Let's go! 🚀",
]

const EmptyCategory = ({ variant, difficulty }: { variant: SudokuVariant, difficulty: SudokuDifficulty }) => {
  const navigate = useNavigate()

  const onVariantChange = useCallback((variant: SudokuVariant) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, difficulty])
  const onDifficultyChange = useCallback((difficulty: SudokuDifficulty) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, variant])

  return (
    <div className="flex flex-col w-full items-center gap-5 py-12 px-6">
      <Typography variant="h2">
        {sample(CONGRATS_MESSAGES)}
      </Typography>
      <div>
        <Typography variant="paragraph">
          You solved all of the puzzles in this category.
        </Typography>
        <Typography variant="paragraph">
          Don't worry, we received a notification to craft more puzzles!
        </Typography>
        <Typography variant="paragraph">
          Meanwhile, you can select other variants or difficulties.
        </Typography>
      </div>
      <div className="w-full md:w-40">
        <VariantSelect value={variant} onChange={onVariantChange} />
      </div>
      <div className="w-full md:w-40">
        <DifficultySelect value={difficulty} onChange={onDifficultyChange} />
      </div>
    </div>
  )
}

export default EmptyCategory
