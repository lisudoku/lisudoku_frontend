import { Link } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { ACTIVE_VARIANTS, SudokuVariantDisplay } from 'src/utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'

const AppFooter = ({ admin }: { admin: boolean }) => {
  const difficulty = useSelector(state => state.userData.difficulty)

  return (
    <footer className="flex flex-col gap-3 pt-2 pb-5 justify-center items-center">
      {!admin && (
        <>
          <div className="flex flex-wrap w-full md:w-3/4 text-medium justify-start">
            {ACTIVE_VARIANTS.map((variant, index) => (
              <div key={index} className="w-full sm:w-1/3 text-center">
                <Link to={`/play/${variant}/${difficulty}`}>
                  Play {SudokuVariantDisplay[variant]} Sudoku
                </Link>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap w-full md:w-3/4 justify-center gap-y-3">
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
              <Link to="/learn">Learn Solving Techniques</Link>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
              <Link to="/tv">Watch Live Solves</Link>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
              <Link to="/solver">Sudoku Variant Solver</Link>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
              <Link to="/about">About</Link>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
              <a href="https://discord.gg/SGV8TQVSeT"
                target="_blank"
                rel="noopener noreferrer">
                <FontAwesomeIcon icon={faDiscord} size="1x" color="#7d87fe" />
              </a>
            </div>
          </div>
        </>
      )}
    </footer>
  )
}

export default AppFooter
