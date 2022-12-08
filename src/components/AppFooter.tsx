import { useSelector } from 'src/hooks'
import { ACTIVE_VARIANTS, SudokuVariantDisplay } from 'src/utils/constants'

const AppFooter = ({ admin }: { admin: boolean }) => {
  const difficulty = useSelector(state => state.userData.difficulty)

  return (
    <footer className="flex flex-col gap-3 pt-2 pb-5 justify-center items-center">
      <div>© {new Date().getFullYear()} George Mărcuș</div>
      <div>lisudoku is a free sudoku app. Have fun!</div>
      {!admin && (
        <div className="flex px-7 gap-10 text-medium">
          {ACTIVE_VARIANTS.map((variant, index) => (
            <a key={index} href={`/play/${variant}/${difficulty}`}>Play {SudokuVariantDisplay[variant]} Sudoku</a>
          ))}
          {/* <a href="/#">Learn</a>
          <a href="/#">Contact</a> */}
        </div>
      )}
    </footer>
  )
}

export default AppFooter
