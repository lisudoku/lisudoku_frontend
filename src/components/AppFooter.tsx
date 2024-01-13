import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'

export const DISCORD_INVITE_URL = 'https://discord.gg/SGV8TQVSeT'

const AppFooter = () => (
  <footer className="flex flex-col gap-3 pt-7 pb-8 justify-center items-center bg-primary brightness-90 backdrop-saturate-200 backdrop-blur-4xl bg-opacity-80 text-primary">
    <div className="flex flex-wrap w-full md:w-3/4 justify-center gap-y-3">
      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
        <Link to="/learn">Learn Solving Techniques</Link>
      </div>
      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
        <Link to="/tv">Watch Live Solves</Link>
      </div>
      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
        <Link to="/solver">Sudoku Variant Solver</Link>
      </div>
      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
        <Link to="/about">About</Link>
      </div>
      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
        <a href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer">
          <FontAwesomeIcon icon={faDiscord} size="1x" color="#7d87fe" />
        </a>
      </div>
    </div>
  </footer>
)

export default AppFooter
