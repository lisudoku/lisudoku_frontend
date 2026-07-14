import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSlash } from '@fortawesome/free-solid-svg-icons'
import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { getErrorsSetsInRegions, regionsCellPeers, UNKNOWN_VALIDATION_RESULT } from '../utils'
import type { Region, SudokuConstraints } from 'lisudoku-solver'
import { times } from 'lodash-es'

const getRegion = (constraints: SudokuConstraints): Region =>
  times(constraints.gridSize, index => ({ row: index, col: constraints.gridSize - 1 - index }))

export const secondaryDiagonalConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faSlash} flip="horizontal" color="purple" title="Secondary Diagonal" />,
  label: 'Secondary Diagonal',
  description: ({ constraints }) => `The purple secondary diagonal must contain distinct digits from 1 to ${constraints.gridSize}.`,
  isGlobal: true,
  isActiveInConstraints: ({ constraints }) => Boolean(constraints.secondaryDiagonal),
  variant: () => SudokuVariant.Diagonal,
  graphics: ({ constraints: { gridSize, secondaryDiagonal }, cellSize }) => (
    <g className="secondary-diagonal stroke-diagonal stroke-[3px]">
      {secondaryDiagonal && (
        <line x1={1} y1={1 + cellSize * gridSize} x2={1 + cellSize * gridSize} y2={1} />
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
