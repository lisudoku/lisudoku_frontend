import { formatISO9075, parseISO } from 'date-fns/esm'
import { Link } from 'react-router-dom'
import Typography from 'src/shared/Typography'
import { UserSolution } from 'src/types'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { formatTimer } from 'src/utils/sudoku'

interface SolvesTableProps {
  userSolutions: UserSolution[]
  isAdmin?: boolean
}

const SolvesTable = ({ userSolutions, isAdmin }: SolvesTableProps) => {
  if (userSolutions.length === 0) {
    return <>
      <Typography variant="paragraph">No puzzle solves yet, but I believe in you!</Typography>
    </>
  }

  return (
    <table className="mt-4 border border-collapse">
      <thead className="border-b">
        <tr className="divide-x">
          <th className="p-2">ID</th>
          <th className="p-2">Date</th>
          <th className="p-2">Puzzle</th>
          <th className="p-2">Solve time</th>
          <th className="p-2"></th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {userSolutions.map((userSolution, index) => (
          <tr key={userSolution.id ?? index} className="h-8 divide-x">
            <td className="p-2 text-center">{userSolution.id ?? '-'}</td>
            <td className="p-2">
              {userSolution.createdAt ? formatISO9075(parseISO(userSolution.createdAt)) : '-'}
            </td>
            <td className="p-2">
              <Link to={getPuzzleRelativeUrl(userSolution.puzzle.publicId ?? '')} target="_blank">
                {userSolution.puzzle.variant !== undefined && `${SudokuVariantDisplay[userSolution.puzzle.variant]}`}
                {' '}
                {userSolution.puzzle.difficulty !== undefined && `${SudokuDifficultyDisplay[userSolution.puzzle.difficulty]}`}
              </Link>
            </td>
            <td className="p-2">{userSolution.solveTime ? formatTimer(userSolution.solveTime) : '-'}</td>
            <td className="p-2">
              {userSolution.id ? (
                <Link to={`/${isAdmin ? 'admin/solves' : 'mysolves'}/${userSolution.id}`}>
                  Play replay
                </Link>
              ) : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default SolvesTable
