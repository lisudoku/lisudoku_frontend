import { Link } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { ACTIVE_VARIANTS, SudokuVariantDisplay } from 'src/utils/constants'

const AppFooter = ({ admin }: { admin: boolean }) => {
  const difficulty = useSelector(state => state.userData.difficulty)

  return (
    <footer className="flex flex-col gap-3 pt-2 pb-5 justify-center items-center">
      {!admin && (
        <>
          <div className="flex px-7 gap-10 text-medium">
            {ACTIVE_VARIANTS.map((variant, index) => (
              <Link key={index} to={`/play/${variant}/${difficulty}`}>
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
