import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import SudokuRules from './SudokuRules'
import ShortcutsButton from './ShortcutsButton'
import PermalinkButton from './PermalinkButton'
import VariantSelect from './VariantSelect'
import DifficultySelect from './DifficultySelect'
import HintPanel from './HintPanel'
import ShowTimerToggle from './ShowTimerToggle'
import CheckErrorsToggle from './CheckErrorsToggle'

const SudokuMisc = () => {
  const navigate = useNavigate()

  const isExternal = useSelector(state => state.puzzle.data!.isExternal)
  const publicId = useSelector(state => state.puzzle.data!.publicId!)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const variant = useSelector(state => state.puzzle.data!.variant)
  const difficulty = useSelector(state => state.userData.difficulty)
  const sourceCollectionId = useSelector(state => state.puzzle.data!.sourceCollectionId)
  const sourceCollectionName = useSelector(state => state.puzzle.data!.sourceCollectionName)

  const onVariantChange = useCallback((variant: SudokuVariant) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, difficulty])
  const onDifficultyChange = useCallback((difficulty: SudokuDifficulty) => {
    navigate(`/play/${variant}/${difficulty}`)
  }, [navigate, variant])

  return (
    <div className="relative flex flex-col md:max-w-xs mt-3 md:mt-0">
      <HintPanel />
      <div className="mb-3">
        <SudokuRules constraints={constraints} />
      </div>
      <div className="bg-gray-900 py-3 px-4">
        {!isExternal && (
          <>
            <div className="w-full md:ml-1">
              <VariantSelect value={variant!} onChange={onVariantChange} />
            </div>
            <div className="w-full md:ml-1 mt-2">
              <DifficultySelect value={difficulty} onChange={onDifficultyChange} />
            </div>
            <PermalinkButton publicId={publicId} />
          </>
        )}
        <ShortcutsButton />
        <div className="mt-2">
          <ShowTimerToggle />
        </div>
        <div className="mt-1">
          <CheckErrorsToggle />
        </div>
        {sourceCollectionId && (
          <div className="flex flex-col mt-2 w-full md:w-fit">
            <div className="text-gray-400 text-sm">
              Source
            </div>
            <Link to={`/collections/${sourceCollectionId}`}
                  target="_blank"
                  className="text-gray-300 font-bold"
            >
              {sourceCollectionName}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SudokuMisc
