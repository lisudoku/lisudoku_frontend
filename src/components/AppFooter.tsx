import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDiscord, faGithub, faTwitter,
  /* faReddit, faRedditAlien, faTiktok, faYoutube */
} from '@fortawesome/free-brands-svg-icons'
// import { faCircle } from '@fortawesome/free-solid-svg-icons'

export const DISCORD_INVITE_URL = 'https://discord.gg/SGV8TQVSeT'
export const GITHUB_URL = 'https://github.com/orgs/lisudoku/repositories'
export const X_URL = 'http://x.com/lisudoku'
// export const YOUTUBE_URL = 'https://www.youtube.com/@lisudoku'
// export const REDDIT_URL = 'https://www.reddit.com/r/lisudoku'
// export const TIKTOK_URL = 'https://www.tiktok.com/@lisudoku'

const AppFooter = () => (
  <footer className="flex justify-center w-full pt-7 pb-8 justify-center bg-primary brightness-95 backdrop-saturate-200 backdrop-blur-4xl bg-opacity-80 text-primary">
    <div className="flex flex-wrap w-full md:w-3/4 gap-y-3">
      <div className="flex w-full justify-center">
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
          <Link to="/learn">Learn Solving Techniques</Link>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
          <Link to="/tv">Watch Live Solves</Link>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
          <Link to="/trainer">Train Your Technique</Link>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
          <Link to="/solver">Sudoku Variant Solver</Link>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center hover:text-primary-hover">
          <Link to="/about">About</Link>
        </div>
      </div>
      <div className="flex w-full justify-center">
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
          <a href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} size="2x" />
          </a>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
          <a href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer">
            <FontAwesomeIcon icon={faDiscord} size="2x" color="#9ca3f2" />
          </a>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
          <a href={X_URL}
            target="_blank"
            rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter} size="2x" color="#2d9bcd" />
          </a>
        </div>
        {/* <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
          <a href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="fa-layers w-8 top-1">
              <FontAwesomeIcon icon={faCircle} color="white" size="1x" className="!left-2" />
              <FontAwesomeIcon icon={faYoutube} size="2x" color="#ff4081" />
            </div>
          </a>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
          <a href={REDDIT_URL}
            target="_blank"
            rel="noopener noreferrer">
            <FontAwesomeIcon icon={faRedditAlien} size="2x" />
          </a>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-fit lg:px-5 text-center">
          <a href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTiktok} size="2x" />
          </a>
        </div> */}
      </div>
    </div>
  </footer>
)

export default AppFooter
