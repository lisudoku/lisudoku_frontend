import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { ConstraintDefinition } from '../types'

export const diagonalsConstraint: Pick<ConstraintDefinition, 'icon' | 'description'> = {
  icon: <FontAwesomeIcon icon={faXmark} color="purple" title="Diagonals" />,
  description: ({ constraints }) => 
    `Both purple diagonals must contain distinct digits from 1 to ${constraints.gridSize}`,
}
