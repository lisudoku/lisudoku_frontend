import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface NavButtonProps {
  onClick: () => void
  disabled: boolean
  icon: IconDefinition
}

const NavButton = ({ icon, onClick, disabled }: NavButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
  >
    <FontAwesomeIcon
      icon={icon}
      color={disabled ? 'gray' : undefined}
      size="3x"
    />
  </button>
)

export default NavButton
