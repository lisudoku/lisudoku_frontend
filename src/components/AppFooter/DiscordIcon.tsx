import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { SizeProp } from '@fortawesome/fontawesome-svg-core'

export const DISCORD_INVITE_URL = 'https://discord.gg/SGV8TQVSeT'

const DiscordIcon = ({ size = '2x' }: { size?: SizeProp }) => (
  <a
    href={DISCORD_INVITE_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="lisudoku Discord server invitation"
  >
    <FontAwesomeIcon icon={faDiscord} size={size} color="#9ca3f2" />
  </a>
)

export default DiscordIcon
