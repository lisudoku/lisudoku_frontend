import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { SizeProp } from '@fortawesome/fontawesome-svg-core'

const GITHUB_URL = 'https://github.com/orgs/lisudoku/repositories'

const GitHubIcon = ({ size = '2x' }: { size?: SizeProp }) => (
  <a
    href={GITHUB_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="lisudoku GitHub repositories"
  >
    <FontAwesomeIcon icon={faGithub} size={size} />
  </a>
)

export default GitHubIcon
