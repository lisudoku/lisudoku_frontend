import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { groupBy, mapValues, sortBy, toPairs } from 'lodash-es'
import PuzzleCard from './PuzzleCard'
import Typography from 'src/design_system/Typography'
import { responsePuzzles } from 'src/reducers/admin'
import { fetchAllPuzzles } from 'src/utils/apiService'
import {
  SudokuDifficultyDisplay, SudokuDifficultyRank, SudokuVariantDisplay, SudokuVariantIcon, SudokuVariantRank,
} from 'src/utils/constants'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { ExtendedPuzzle } from 'src/types'
import { VariantSelect } from 'src/components/VariantSelect'

export const PuzzlesPage = () => {
  const [ variant, setVariant ] = useState<SudokuVariant>(SudokuVariant.Classic)
  const [ loading, setLoading ] = useState(true)
  const dispatch = useDispatch()
  const puzzles = useSelector(state => state.admin.puzzles)
  const userToken = useSelector(state => state.userData.token)

  useEffect(() => {
    fetchAllPuzzles(variant, userToken!).then(data => {
      dispatch(responsePuzzles(data.puzzles))
      setLoading(false)
    })
  }, [variant, dispatch, userToken])

  const puzzleGroups = useMemo(() => {
    const sortedPuzzles = sortBy(puzzles, (puzzle: ExtendedPuzzle) => (
      SudokuVariantRank[puzzle.variant!] * 100 + SudokuDifficultyRank[puzzle.difficulty!]
    ))
    const groups = groupBy(sortedPuzzles, 'variant')
    const processedGroups = mapValues(
      groups,
      variantPuzzles => toPairs(groupBy(variantPuzzles, 'difficulty')),
    )
    const groupPairs = toPairs(processedGroups)
    return groupPairs
  }, [puzzles])

  return (
    <div>
      {loading ? (
        'Loading...'
      ) : (
        <>
          <div className="p-3 md:max-w-56">
            <VariantSelect
              value={variant}
              onChange={(variant: SudokuVariant) => { setVariant(variant) }}
            />
          </div>
          {puzzleGroups.map(([variant, variantGroups]) => (
            <div key={variant}>
              {variantGroups.map(([difficulty, puzzles]) => (
                <div key={variant + difficulty} >
                  <Typography variant="h4">
                    {SudokuVariantIcon[variant as SudokuVariant]}
                    {' '}
                    {`${SudokuVariantDisplay[variant as SudokuVariant]} - ${SudokuDifficultyDisplay[difficulty as SudokuDifficulty]} (${puzzles.length})`}
                  </Typography>
                  <div className="flex flex-wrap p-5 pt-2 gap-4">
                    {puzzles.map(puzzle => (
                      <div key={puzzle.id} className="w-fit">
                        <PuzzleCard puzzle={puzzle} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

