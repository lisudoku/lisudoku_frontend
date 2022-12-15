import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import _ from 'lodash'
import { Typography } from '@material-tailwind/react'
import PuzzleCard from './PuzzleCard'
import { responsePuzzles } from 'src/reducers/admin'
import { fetchAllPuzzles } from 'src/utils/apiService'
import {
  SudokuDifficultyDisplay, SudokuDifficultyRank, SudokuVariantDisplay, SudokuVariantRank,
} from 'src/utils/constants'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

const PuzzlesPage = () => {
  const [ loading, setLoading ] = useState(true)
  const dispatch = useDispatch()
  const puzzles = useSelector(state => state.admin.puzzles)
  const userToken = useSelector(state => state.userData.token)

  useEffect(() => {
    fetchAllPuzzles(userToken!).then(data => {
      dispatch(responsePuzzles(data.puzzles))
      setLoading(false)
    })
  }, [dispatch, userToken])

  const puzzleGroups = useMemo(() => (
    _.chain(puzzles)
     .sortBy(puzzle => (
       SudokuVariantRank[puzzle.variant] * 100 + SudokuDifficultyRank[puzzle.difficulty]
     ))
     .groupBy('variant')
     .mapValues(variantPuzzles => (
        _.chain(variantPuzzles)
         .groupBy('difficulty')
         .toPairs()
         .value()
     ))
     .toPairs()
     .value()
  ), [puzzles])

  return (
    <div>
      {loading ? (
        'Loading...'
      ) : (
        puzzleGroups.map(([variant, variantGroups]) => (
          <div key={variant}>
            {variantGroups.map(([difficulty, puzzles]) => (
              <div key={variant + difficulty} >
                <Typography variant="h4">
                  {`${SudokuVariantDisplay[variant as SudokuVariant]} - ${SudokuDifficultyDisplay[difficulty as SudokuDifficulty]} (${puzzles.length})`}
                </Typography>
                <div className="flex flex-wrap p-5 pt-2 gap-4">
                  {puzzles.map(puzzle => (
                    <div key={puzzle.publicId} className="w-fit">
                      <PuzzleCard puzzle={puzzle} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

export default PuzzlesPage
