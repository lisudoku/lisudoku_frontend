import { SudokuVariant } from 'src/types/sudoku'
import SudokuVariantCard from './SudokuVariantCard'

const HomePage = () => (
  <div className="flex flex-wrap mx-auto w-full lg:w-2/3 p-1 bg-gray-900 drop-shadow-2xl border rounded border-gray-800">
    <SudokuVariantCard variant={SudokuVariant.Classic} />
    <SudokuVariantCard variant={SudokuVariant.Thermo} />
    <SudokuVariantCard variant={SudokuVariant.Killer} />
    <SudokuVariantCard variant={SudokuVariant.Arrow} />
    <SudokuVariantCard variant={SudokuVariant.Irregular} />
    <SudokuVariantCard variant={SudokuVariant.Kropki} />
    <SudokuVariantCard variant={SudokuVariant.TopBot} />
    <SudokuVariantCard variant={SudokuVariant.Diagonal} />
    <SudokuVariantCard variant={SudokuVariant.Mixed} />
  </div>
)

export default HomePage
