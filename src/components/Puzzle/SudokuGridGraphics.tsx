import { Fragment } from 'react'
import classNames from 'classnames'
import { CellPosition, SudokuConstraints } from 'lisudoku-solver'
import { groupBy, isEmpty, partition, times } from 'lodash-es'
import { CellMarks, ConstraintType, Grid } from 'src/types/sudoku'
import { CornerMarksGraphics } from './SudokuGridGraphics/CornerMarksGraphics'
import { useOnGridClick, useOnMouseMove } from './SudokuGridGraphics/utils'
import { useErrorsGrid } from './hooks/useErrorsGrid'
import { useFixedNumbersGrid } from './hooks/useFixedNumbersGrid'
import { CustomGraphics, CustomGraphicsCornerMarks, CustomGraphicsItem } from './SudokuGridGraphics/CustomGraphics/CustomGraphics'
import { HighlightedCell } from './SudokuGridGraphics/HighlightedCell'
import { Theme, useTheme } from '../ThemeProvider'
import { constraintDefinitions } from 'src/constraints/definitions'
import type { ConstraintDefinition } from 'src/constraints/types'
import { CenterMarksGraphics } from './SudokuGridGraphics/CenterMarksGraphics'

interface GridlinesGraphicsProps {
  gridSize: number
  cellSize: number
  borderHighlightColor?: string
  theme: Theme
}

const GridlinesGraphics = ({ gridSize, cellSize, borderHighlightColor, theme }: GridlinesGraphicsProps) => (
  <>
    <g className={classNames('border-highlights', borderHighlightColor ?? 'stroke-cell-border-strong')}>
      <line x1="0" y1="1" x2={gridSize * cellSize + 2} y2="1" />
      <line x1="1" y1="0" x2="1" y2={gridSize * cellSize + 2} />
      <line x1="0" y1={gridSize * cellSize + 1} x2={gridSize * cellSize + 2} y2={gridSize * cellSize + 1} />
      <line x1={gridSize * cellSize + 1} y1="0" x2={gridSize * cellSize + 1} y2={gridSize * cellSize + 2} />
    </g>
    <g className={classNames('grid-lines stroke-cell-border-weak', {
      'mix-blend-screen': theme === Theme.Dark,
      'mix-blend-darken': theme === Theme.Light,
    })}>
      {times(gridSize - 1).map(row => (
        <line
          key={`R${row}`}
          x1="1"
          y1={1 + cellSize * (row + 1)}
          x2={1 + cellSize * gridSize}
          y2={1 + cellSize * (row + 1)}
        />
      ))}
      {times(gridSize - 1).map(col => (
        <line
          key={`C${col}`}
          x1={1 + cellSize * (col + 1)}
          y1="1"
          x2={1 + cellSize * (col + 1)}
          y2={1 + cellSize * gridSize}
        />
      ))}
    </g>
  </>
)

const SelectedCellGraphics = ({ cellSize, selectedCells }: SelectedCellGraphicsProps) => (
  <>
    {selectedCells?.map((selectedCell: CellPosition, index: number) => (
      <HighlightedCell
        cell={selectedCell}
        cellSize={cellSize}
        className="opacity-25 stroke-cell-selected fill-cell-selected"
        key={index}
      />
    ))}
  </>
)

type SelectedCellGraphicsProps = {
  cellSize: number
  selectedCells?: CellPosition[]
}

export const graphicsConstraintsOrder = [
  ConstraintType.ExtraRegions,
  ConstraintType.Odd,
  ConstraintType.Even,
  ConstraintType.KillerCage,
  ConstraintType.Thermo,
  ConstraintType.Renban,
  ConstraintType.Palindrome,
  ConstraintType.Arrow,
  ConstraintType.PrimaryDiagonal,
  ConstraintType.SecondaryDiagonal,
  ConstraintType.Regions,
  ConstraintType.FixedNumber,
  ConstraintType.KropkiConsecutive,
  ConstraintType.KropkiDouble,

  ConstraintType.AntiKnight,
  ConstraintType.AntiKing,
  ConstraintType.KropkiNegative,
  ConstraintType.TopBottom,
] as const satisfies ConstraintType[]

const assertExhaustiveConstraintOrder = (order: readonly ConstraintType[]) => {
  if ([...order].sort().toString() !== Object.keys(constraintDefinitions).sort().toString()) {
    throw new Error('Constraint order is not exhaustive.')
  }
}

assertExhaustiveConstraintOrder(graphicsConstraintsOrder)

const [graphicsConstraintsUnderGridlines, graphicsConstraintsAboveGridlines] = partition(
  graphicsConstraintsOrder,
  constraintType => (
    constraintType !== ConstraintType.KropkiConsecutive && constraintType !== ConstraintType.KropkiDouble
  ),
)

interface SudokuConstraintsGraphicsProps {
  constraints: SudokuConstraints
  cellMarks?: CellMarks[][]
  cellSize: number
  grid?: Grid
  checkErrors: boolean
  selectedCells?: CellPosition[]
  onCellClick?: (cell: CellPosition, ctrl: boolean, isClick: boolean, doubleClick: boolean) => void
  customGraphics?: CustomGraphicsItem[]
  borderHighlightColor?: string
}

// For testing puzzle with all constraints
// N4IghgThD2DuDOIBcBtUkawMIFMA2eiqoAxtHsgBwA0ImyArAL7WnlW31IAsLbFSAOyc4yXqxBkBANhGxkAZiYBdWiQCWEEnhy4CRNJPZIGc5NL5GZZpBYlTkwuqNuWHSGs%2FmvlK2jgA3HAA7PUJkQ3dPLko%2FEBwADwAXCDAAJRwAc3VoYINI4wUbAEY3Y24SsoFTL2RS%2B0KbACYqsWbWk3aGgSLapCVutr6B%2FkYbJVUCgWKbZkGkJtmO3q450aQZvrt1xa3lm22rOptBDt2uU%2FmVl1PlVRAAM3UEnAATADkAVwBbACMcCAGUAAB2g8HUSRywWQ6xqFxYIACYDwnxwyBaElB4MhuRhR1s4wRSJRaP6lixEKhePcThiRORqOQAE5yWDKbikOtoi5YrRiYzXJi2TjoZz8RU%2BhjEQzSbdaJkIOpXgBldQAL1JTNoAGt1AQAVgwJkcEC6FkqcR8bSXAAGDrc7x2%2BbW7z1LmVe7wH51CY6mDA3UAEWgSVNJHweGK1OMDvRCPDBCa0YEsbJtFeIYAKgBPYGkkBYXLwHAkT6QoIgNwRqNi9w2mxOyQRpO14ybLiNjNJHN55AgYOfX46Sv3aCvV5hMPGF1UOLA5HqYKvGDfE0RKbHPq89b1rcdXfw%2BYHlwWO6cEK%2FMB5dewmzb8V3%2FZ7%2BbnHkqe5JAAWAO%2BYJv%2BLhG4OglQ91mubxLh2A53yYIA%3D
export const SudokuConstraintsGraphics = ({
  cellSize, constraints, cellMarks, grid, checkErrors, selectedCells,
  onCellClick, customGraphics, borderHighlightColor,
}: SudokuConstraintsGraphicsProps) => {
  // TODO: maybe extract this to not be dependend on the theme?
  const { theme } = useTheme()
  const defaultAreaColor = theme === Theme.Light ? 'grey' : 'lightgray'
  const defaultCellColor = theme === Theme.Light ? 'green' : 'lightgreen'

  const { gridSize, fixedNumbers, killerCages } = constraints
  const onGridClick = useOnGridClick(cellSize, gridSize, onCellClick)
  const onMouseMove = useOnMouseMove(cellSize, gridSize, onCellClick)
  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)
  const killerActive = !isEmpty(killerCages)

  // TODO: think about merging cellMarksErrors with custom graphics
  const errorGrid = useErrorsGrid(checkErrors, constraints, grid, cellMarks)

  // TODO: add common props to a context instead
  // Examples: gridSize, cellSize, fixedNumbersGrid, areaColor, cellColor

  const customGraphicsByType = groupBy(customGraphics, 'type')
  const cellHighlightCustomGraphics = customGraphicsByType['area-highlight'] ?? []
  const cornerMarksCustomGraphics = customGraphicsByType['corner-marks'] as CustomGraphicsCornerMarks[] ?? []

  const graphicsCtx: Parameters<ConstraintDefinition['graphics']>[0] = {
    constraints, gridSize, cellSize, errorGrid, fixedNumbersGrid, grid,
  }
  const renderConstraint = (constraintType: ConstraintType) => (
    <Fragment key={constraintType}>
      {constraintDefinitions[constraintType].graphics(graphicsCtx)}
    </Fragment>
  )

  return (
    <svg
      height={gridSize * cellSize + 2}
      width={gridSize * cellSize + 2}
      className="top-0 left-0 stroke-[2px]"
      // Using onMouseDown instead of onClick for the cases when you
      // start the click somewhere and end it in another place.
      onMouseDown={onGridClick}
      // Select cells as you drag your mouse over them
      onMouseMove={onMouseMove}
    >
      {/* The order of rendering the graphics is important! */}
      {/* This renders elements from the bottom to the top, so the last items are on top */}
      <CustomGraphics
        items={cellHighlightCustomGraphics}
        cellSize={cellSize}
        constraints={constraints}
        defaultAreaColor={defaultAreaColor}
        defaultCellColor={defaultCellColor}
      />

      {graphicsConstraintsUnderGridlines.map(renderConstraint)}

      <GridlinesGraphics
        gridSize={gridSize}
        cellSize={cellSize}
        borderHighlightColor={borderHighlightColor}
        theme={theme}
      />
      <SelectedCellGraphics cellSize={cellSize} selectedCells={selectedCells} />

      {graphicsConstraintsAboveGridlines.map(renderConstraint)}

      <CornerMarksGraphics
        cellSize={cellSize}
        constraints={constraints}
        cellMarks={cellMarks}
        grid={grid}
        fixedNumbersGrid={fixedNumbersGrid}
        killerActive={killerActive}
        errorGrid={errorGrid}
        customGraphics={cornerMarksCustomGraphics}
        theme={theme}
      />
      <CenterMarksGraphics
        cellSize={cellSize}
        constraints={constraints}
        cellMarks={cellMarks}
        grid={grid}
        fixedNumbersGrid={fixedNumbersGrid}
        errorGrid={errorGrid}
      />
    </svg>
  )
}
