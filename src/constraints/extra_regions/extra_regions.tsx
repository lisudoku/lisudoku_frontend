import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ConstraintContext, ConstraintDefinition } from '../types'
import { sortBy } from 'lodash-es'
import { SudokuVariant } from 'src/types/sudoku'
import { getErrorsSetsInRegions, regionsCellPeers, removeConstraintFromArray } from '../utils'
import { faSquare } from '@fortawesome/free-solid-svg-icons'
import { extraRegionsGraphics } from './graphics'
import type { Area } from 'lisudoku-solver'

export const extraRegionsConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faSquare} size="sm" className="text-cyan-700" title="Extra Regions" />,
  label: 'Extra Regions',
  description: ({ constraints: { gridSize }}) =>
    `Each blue region contains each digit from 1 to ${gridSize}.`,
  isGlobal: false,
  dataKey: 'extraRegions',
  isActiveInConstraints: ({ constraints }) => (constraints.extraRegions ?? []).length > 0,
  variant: () => SudokuVariant.ExtraRegions,
  graphics: extraRegionsGraphics,
  cellPeers: ({ constraints, cell }) => regionsCellPeers(constraints.extraRegions ?? [], cell),
  areaCells: (area: Area, ctx: ConstraintContext) => {
    if (area.type !== 'Region') {
      return []
    }
    if (ctx.constraints.regions === undefined) {
      throw Error('no regions in constraints')
    }
    if (area.value < ctx.constraints.regions.length) {
      return []
    }
    return ctx.constraints.extraRegions![area.value - ctx.constraints.regions.length]
  },
  areaDisplay: (area: Area, ctx: ConstraintContext) => {
    if (area.type !== 'Region' || area.value < ctx.constraints.gridSize) {
      throw new Error(`extra region constraint cannot handle area ${JSON.stringify(area)}`)
    }
    return `extra region ${area.value - ctx.constraints.gridSize + 1}`
  },
  errors: ({ valuesGrid, constraints, cellMarksGrid }) => (
    getErrorsSetsInRegions(constraints.extraRegions ?? [], valuesGrid, cellMarksGrid)
  ),
  removeConstraintsAtCell: ({ constraints, isSelectedCell }) => {
    removeConstraintFromArray(constraints.extraRegions, isSelectedCell)
  },
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: ({ constraints, editorState }) => {
    if (editorState.selectedCells.length === 0) {
      return {
        type: 'info',
        message: 'Select at least one cell. You can select multiple cells with Shift+Click or by dragging.',
      }
    }

    if (editorState.selectedCells.length !== constraints.gridSize) {
      return {
        type: 'error',
        message: `Extra region must be of size ${constraints.gridSize}. Select multiple cells with Shift+Click or by dragging.`,
      }
    }

    return {
      type: 'success',
    }
  },
  prepareCurrentConstraint: ({ constraints, editorState }) => {
    const region = sortBy(editorState.selectedCells, [ 'row', 'col' ])

    return {
      newEditorState: {
        ...editorState,
        selectedCells: region,
      },
      newConstraints: {
        ...constraints,
        extraRegions: [
          ...(constraints.extraRegions ?? []),
          region,
        ],
      }
    }
  },
}
