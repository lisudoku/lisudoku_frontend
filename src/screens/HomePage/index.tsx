import { useLayoutEffect } from 'react'
import { useSelector } from 'src/hooks'
import SudokuVariantCard from './SudokuVariantCard'
import { ACTIVE_VARIANTS } from 'src/utils/constants'

const HomePage = () => {
  const difficulty = useSelector(state => state.userData.difficulty)
  useLayoutEffect(() => {
    document.title = 'lisudoku - Free Online Sudoku'
  }, [])

  return (
    <div className="flex flex-wrap mx-auto w-full lg:w-[46rem] p-1 bg-gray-900 border rounded border-gray-800">
      {ACTIVE_VARIANTS.map((variant, index) => (
        <SudokuVariantCard key={index} variant={variant} difficulty={difficulty} />
      ))}
    </div>
  )
}

export default HomePage
