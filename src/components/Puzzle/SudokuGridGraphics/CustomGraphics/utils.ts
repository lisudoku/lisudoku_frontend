import type { Area, CellPosition } from 'lisudoku-solver'
import { CustomGraphicsAreaHighlight, CustomGraphicsCornerMarks } from './CustomGraphics'

export const cellToArea = (cell: CellPosition): Area => ({
  type: 'Cell',
  value: [cell.row, cell.col],
})

export const cellToCustomGraphicsItem = (
  cell: CellPosition,
  color?: CustomGraphicsAreaHighlight['color'],
  opacity?: CustomGraphicsAreaHighlight['opacity'],
): CustomGraphicsAreaHighlight => ({
  type: 'area-highlight',
  area: cellToArea(cell),
  color,
  opacity,
})

export const areaToCustomGraphicsItem = (area: Area, color?: CustomGraphicsAreaHighlight['color']): CustomGraphicsAreaHighlight => ({
  type: 'area-highlight',
  area,
  color,
})

export const buildCornerMarkGraphicsItem = (
  cell: CellPosition, values: number[], backgroundColor?: CustomGraphicsCornerMarks['backgroundColor'],
): CustomGraphicsCornerMarks => ({
  type: 'corner-marks',
  backgroundColor,
  cell,
  values,
})
