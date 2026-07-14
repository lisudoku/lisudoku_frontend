import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSlash } from '@fortawesome/free-solid-svg-icons'
import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { getErrorsSetsInRegions, regionsCellPeers, UNKNOWN_VALIDATION_RESULT } from '../utils'
import type { Region, SudokuConstraints } from 'lisudoku-solver'
import { times } from 'lodash-es'

const getRegion = (constraints: SudokuConstraints): Region =>
  times(constraints.gridSize, index => ({ row: index, col: index }))

export const primaryDiagonalConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faSlash} color="purple" title="Primary Diagonal" />,
  label: 'Primary Diagonal',
  description: ({ constraints }) => `The purple primary diagonal must contain distinct digits from 1 to ${constraints.gridSize}.`,
  isGlobal: true,
  isActiveInConstraints: ({ constraints }) => Boolean(constraints.primaryDiagonal),
  variant: () => SudokuVariant.Diagonal,
  graphics: ({ constraints: { gridSize, primaryDiagonal }, cellSize }) => (
    <g className="primary-diagonal stroke-diagonal stroke-[3px]">
      {primaryDiagonal && (
        <line x1={1} y1={1} x2={1 + cellSize * gridSize} y2={1 + cellSize * gridSize} />
      )}
    </g>
  ),
  cellPeers: ({ constraints, cell }) => regionsCellPeers(
    [getRegion(constraints)],
    cell,
  ),
  errors: ({ constraints, valuesGrid, cellMarksGrid }) => {
    const region = getRegion(constraints)
    const errorSets = getErrorsSetsInRegions([region], valuesGrid, cellMarksGrid)
    return errorSets
  },
  removeConstraintsAtCell: () => {},
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: () => UNKNOWN_VALIDATION_RESULT,
  prepareCurrentConstraint: () => null,
}
