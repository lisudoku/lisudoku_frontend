import type { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface NavButtonProps {
  onClick: () => void
  disabled: boolean
  icon: IconDefinition
  size: SizeProp
}

export const NavButton = ({ onClick, disabled, ...props }: NavButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
  >
    <FontAwesomeIcon
      color={disabled ? 'gray' : undefined}
      {...props}
    />
  </button>
)
