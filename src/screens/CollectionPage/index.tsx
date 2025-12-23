import { useEffect, useState } from 'react'
import { fromPairs, sortBy } from 'lodash-es'
import { useSelector } from 'src/hooks'
import PageMeta from 'src/components/PageMeta'
import { Link, useParams } from 'react-router-dom'
import LoadingSpinner from 'src/design_system/LoadingSpinner'
import Typography from 'src/design_system/Typography'
import { PuzzleCollection } from 'src/types'
import { fetchPuzzleCollection } from 'src/utils/apiService'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { camelCaseKeys } from 'src/utils/json'
import { formatTimer } from 'src/utils/sudoku'

const CollectionPage = () => {
  const { id } = useParams()
  const [ puzzleCollection, setPuzzleCollection ] = useState<PuzzleCollection>()
  const solvedPuzzles = useSelector(
    state => fromPairs(state.userData.solvedPuzzles.map(
      solvedPuzzle => [solvedPuzzle.puzzle.publicId, solvedPuzzle]
    ))
  )

  useEffect(() => {
    fetchPuzzleCollection(id!).then(data => {
      const puzzleData: PuzzleCollection = camelCaseKeys(data)
      setPuzzleCollection(puzzleData)
    })
  }, [id])

  if (!puzzleCollection) {
    return <LoadingSpinner fullPage />
  }

  return (
    <>
      <PageMeta title={puzzleCollection.name}
                url={`https://lisudoku.xyz/collections/${id}`}
                description="Collections of puzzles from various sources" />

      <Typography variant="h3">
        {puzzleCollection.name}
      </Typography>

      <Typography variant="h6">
        URL:
        {' '}
        <a href={puzzleCollection.url}
           target="_blank"
           rel="noopener noreferrer"
           className="underline"
        >
          {puzzleCollection.url}
        </a>
      </Typography>

      <table className="mt-4 border border-collapse">
        <thead className="border-b">
          <tr className="divide-x">
            <th className="p-2">#</th>
            <th className="p-2 min-w-20">Solved?</th>
            <th className="p-2">Variant</th>
            <th className="p-2">Difficulty</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sortBy(puzzleCollection.puzzles, [ 'variant', 'difficulty' ]).map((puzzle, index) => (
            <tr key={puzzle.id} className="h-8 divide-x">
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2">
                {solvedPuzzles[puzzle.publicId!] !== undefined && (
                  <div className="flex gap-1 items-center justify-center">
                    {solvedPuzzles[puzzle.publicId!].solveTime !== undefined &&
                      formatTimer(solvedPuzzles[puzzle.publicId!].solveTime)}
                    <FontAwesomeIcon icon={faCircleCheck} size="sm" color="lightgreen" />
                  </div>
                )}
              </td>
              <td className="p-2">{SudokuVariantDisplay[puzzle.variant!]}</td>
              <td className="p-2">{SudokuDifficultyDisplay[puzzle.difficulty!]}</td>
              <td className="p-2">
                <Link to={getPuzzleRelativeUrl(puzzle.publicId!)} target="_blank">
                  Play
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default CollectionPage
