import React, { CSSProperties } from 'react'
import { Area, CellPosition, SudokuConstraints } from 'lisudoku-solver'
import { HighlightedCell } from '../HighlightedCell'
import { getAreaCells, isCellArea } from 'src/utils/sudoku'

export interface CustomGraphicsAreaHighlight {
  type: 'area-highlight'
  area: Area
  color?: CSSProperties['color'] | 'area'
}

export interface CustomGraphicsCornerMarks {
  type: 'corner-marks'
  cell: CellPosition
  values: number[]
  backgroundColor?: string
  color?: CSSProperties['color']
  showExtraValues?: boolean
}

export type CustomGraphicsItem =
  | CustomGraphicsAreaHighlight
  | CustomGraphicsCornerMarks

interface CustomGraphicsProps {
  cellSize: number
  constraints: SudokuConstraints
  items: CustomGraphicsItem[]
  defaultAreaColor: NonNullable<CustomGraphicsAreaHighlight['color']>
  defaultCellColor: NonNullable<CustomGraphicsAreaHighlight['color']>
}

const getCustomGraphicsItemColor = (
  item: CustomGraphicsAreaHighlight,
  defaultAreaColor: CustomGraphicsProps['defaultAreaColor'],
  defaultCellColor: CustomGraphicsProps['defaultCellColor'],
) => {
  if (item.color === 'area') {
    return defaultAreaColor
  }
  if (item.color !== undefined) {
    return item.color
  }
  if (isCellArea(item.area)) {
    return defaultCellColor
  }
  return defaultAreaColor
}

export const CustomGraphics = ({
  items, cellSize, constraints, defaultAreaColor, defaultCellColor,
}: CustomGraphicsProps) => (
  <g className="custom-graphics font-bold">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {item.type === 'area-highlight' && (
          getAreaCells(item.area, constraints).map((cell, cellIndex) => (
            <HighlightedCell
              key={cellIndex}
              cell={cell}
              cellSize={cellSize}
              className="opacity-40"
              style={{
                fill: getCustomGraphicsItemColor(item, defaultAreaColor, defaultCellColor),
                stroke: getCustomGraphicsItemColor(item, defaultAreaColor, defaultCellColor),
              }}
            />
          ))
        )}
      </React.Fragment>
    ))}
  </g>
)
