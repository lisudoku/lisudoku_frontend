import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { sumBy } from 'lodash-es'
import { fetchGroupCounts } from 'src/utils/apiService'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { useSelector } from 'src/hooks'

type GroupCount = {
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  puzzle_count: number
  solve_count: number
}

const GroupCounts = () => {
  const [ loading, setLoading ] = useState(true)
  const [ groupCounts, setGroupCounts ] = useState<GroupCount[]>([])
  const userToken = useSelector(state => state.userData.token)

  useEffect(() => {
    setLoading(true)
    fetchGroupCounts(userToken!).then(data => {
      setGroupCounts(data.group_counts)
      setLoading(false)
    })
  }, [userToken])

  return (
    <div>
      {loading ? (
        'Loading...'
      ) : (
        <table className="border border-collapse">
          <thead className="border-b">
            <tr className="divide-x">
              <th className="p-2">Variant</th>
              <th className="p-2">Difficulty</th>
              <th className="p-2">Puzzles</th>
              <th className="p-2">Solved</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="h-8 divide-x">
              <td colSpan={2} className="p-2">Total</td>
              <td className="text-center p-2 font-bold">
                {sumBy(groupCounts, 'puzzle_count')}
              </td>
              <td className="text-center p-2 font-bold">
                {sumBy(groupCounts, 'solve_count')}
              </td>
            </tr>
            {groupCounts.map(({ variant, difficulty, puzzle_count, solve_count }) => (
              <tr key={`${variant}-${difficulty}`} className="h-8 divide-x">
                <td className="p-2">{variant}</td>
                <td className="p-2">{difficulty}</td>
                <td className={classNames('text-center p-2 font-bold', {
                  'bg-green-500': puzzle_count >= 10,
                  'bg-yellow-200 text-black': 3 <= puzzle_count && puzzle_count < 10,
                  'bg-red-400': puzzle_count < 3,
                })}>{puzzle_count}</td>
                <td className={classNames('text-center p-2 font-bold', {
                  'bg-red-400': solve_count === puzzle_count,
                })}>{solve_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default GroupCounts
