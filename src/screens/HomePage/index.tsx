import { useLayoutEffect } from 'react'
import { useSelector } from 'src/hooks'
import SudokuVariantCard from './SudokuVariantCard'
import { ACTIVE_VARIANTS } from 'src/utils/constants'
import ContestsAlert from './ContestsAlert'

const HomePage = () => {
  const difficulty = useSelector(state => state.userData.difficulty)
  useLayoutEffect(() => {
    document.title = 'lisudoku - Free Online Sudoku'
  }, [])

  return (
    <>
      <ContestsAlert />
      <div className="p-5">
        <div className="flex flex-wrap mx-auto w-[14.7rem] sm:w-[28.7rem] md:w-[42.8rem] lg:w-[56.8rem] xl:w-[70.7rem] p-1 bg-gray-900 border rounded border-gray-800">
          {ACTIVE_VARIANTS.map((variant, index) => (
            <SudokuVariantCard key={index} variant={variant} difficulty={difficulty} />
          ))}
        </div>
      </div>
    </>
  )
}

export default HomePage
