import { SudokuVariant } from 'src/types/common'

const SudokuVariantCard = ({ variant }: { variant: SudokuVariant }) => (
  <div className="w-full sm:w-1/2 md:w-1/3 p-2">
    <div className="h-48 flex flex-col items-center justify-center border cursor-pointer text-3xl">
      <span>{variant}</span>
      <span>Sudoku</span>
    </div>
  </div>
)

export default SudokuVariantCard
