import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { fetchGroupCounts } from 'src/utils/apiService'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

type GroupCount = {
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  count: number
}

const GroupCounts = () => {
  const [ loading, setLoading ] = useState(true)
  const [ groupCounts, setGroupCounts ] = useState<GroupCount[]>([])

  useEffect(() => {
    setLoading(true)
    fetchGroupCounts().then(data => {
      setGroupCounts(data.group_counts)
      setLoading(false)
    })
  }, [])

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
              <th className="p-2">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {groupCounts.map(({ variant, difficulty, count }, index) => (
              <tr key={index} className="h-8 divide-x">
                <td className="p-2">{variant}</td>
                <td className="p-2">{difficulty}</td>
                <td className={classNames('flex justify-center p-2 font-bold', {
                  'bg-green-500': count >= 10,
                  'bg-yellow-200 text-black': count > 0 && count < 10,
                  'bg-red-400': count === 0,
                })}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default GroupCounts
