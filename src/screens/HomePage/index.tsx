import { useSelector } from 'src/hooks'
import SudokuVariantCard from './SudokuVariantCard'
import { ACTIVE_VARIANTS } from 'src/utils/constants'
import ContestsAlert from './ContestsAlert'
import PageMeta from 'src/components/PageMeta'

const HomePage = () => {
  const difficulty = useSelector(state => state.userData.difficulty)

  return (
    <>
      <PageMeta title="lisudoku - Free Online Sudoku Variants"
                url="https://lisudoku.xyz"
                description="Play sudoku variants for free" />
      <ContestsAlert />
      <div className="p-2">
        <div className="flex flex-wrap mx-auto w-full sm:w-[28.7rem] md:w-[42.8rem] lg:w-[56.8rem] p-1 bg-secondary border rounded border-secondary">
          {ACTIVE_VARIANTS.map((variant, index) => (
            <SudokuVariantCard key={index} variant={variant} difficulty={difficulty} />
          ))}
        </div>
      </div>
    </>
  )
}

export default HomePage
