import { Link } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { ACTIVE_VARIANTS, SudokuVariantDisplay } from 'src/utils/constants'

const AppFooter = ({ admin }: { admin: boolean }) => {
  const difficulty = useSelector(state => state.userData.difficulty)

  return (
    <footer className="flex flex-col gap-3 pt-2 pb-5 justify-center items-center">
      {!admin && (
        <>
          <div className="flex flex-wrap w-full md:w-3/4 text-medium justify-center">
            {ACTIVE_VARIANTS.map((variant, index) => (
              <Link key={index} to={`/play/${variant}/${difficulty}`} className="w-full sm:w-1/3 text-center">
                Play {SudokuVariantDisplay[variant]} Sudoku
              </Link>
            ))}
          </div>
          <Link to="/about">About</Link>
        </>
      )}
    </footer>
  )
}

export default AppFooter
