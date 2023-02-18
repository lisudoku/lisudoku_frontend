import { useEffect, useState } from 'react'
import { useSelector } from 'src/hooks'
import _ from 'lodash'
import PageMeta from 'src/components/PageMeta'
import { Link, useParams } from 'react-router-dom'
import { Typography } from '@material-tailwind/react'
import LoadingSpinner from 'src/components/LoadingSpinner'
import { PuzzleCollection } from 'src/types'
import { fetchPuzzleCollection } from 'src/utils/apiService'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
const jcc = require('json-case-convertor')

const CollectionPage = () => {
  const { id } = useParams()
  const [ puzzleCollection, setPuzzleCollection ] = useState<PuzzleCollection>()
  const solvedPuzzleIds = useSelector(state => state.userData.solvedPuzzles.map(puzzle => puzzle.id))

  useEffect(() => {
    fetchPuzzleCollection(id!).then(data => {
      const puzzleData: PuzzleCollection = jcc.camelCaseKeys(data)
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
            <th className="p-2 w-20">Solved?</th>
            <th className="p-2">Variant</th>
            <th className="p-2">Difficulty</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {_.sortBy(puzzleCollection.puzzles, [ 'variant', 'difficulty' ]).map(puzzle => (
            <tr key={puzzle.id} className="h-8 divide-x">
              <td className="p-2 text-center">
                {solvedPuzzleIds.includes(puzzle.publicId!) && (
                  <FontAwesomeIcon icon={faCircleCheck} size="sm" color="lightgreen" />
                )}
              </td>
              <td className="p-2">{SudokuVariantDisplay[puzzle.variant]}</td>
              <td className="p-2">{SudokuDifficultyDisplay[puzzle.difficulty]}</td>
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
