import { useSelector } from 'src/hooks'
import { SudokuVariant } from 'src/types/sudoku'
import SudokuVariantCard from './SudokuVariantCard'

const HomePage = () => {
  const difficulty = useSelector(state => state.userData.difficulty)

  return (
    <div className="flex flex-wrap mx-auto w-full lg:w-2/3 p-1 bg-gray-900 drop-shadow-2xl border rounded border-gray-800">
      <SudokuVariantCard variant={SudokuVariant.Classic} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.Thermo} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.Killer} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.Arrow} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.Irregular} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.Kropki} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.TopBot} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.Diagonal} difficulty={difficulty} />
      <SudokuVariantCard variant={SudokuVariant.Mixed} difficulty={difficulty} />
    </div>
  )
}

export default HomePage
