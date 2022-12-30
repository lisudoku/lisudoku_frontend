import { ReactElement, MouseEvent, useCallback } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { CellPosition, Grid, Region, SudokuConstraints, Thermo } from 'src/types/sudoku'
import { getAllCells } from 'src/utils/sudoku'
import { useErrorGrid, useFixedNumbersGrid } from './hooks'

type Border = {
  x1: number
  y1: number
  x2: number
  y2: number
}

const BordersGraphics = ({ gridSize, regions, cellSize }: BordersGraphicsProps) => {
  const regionGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  regions.forEach((regionCells, regionIndex) => {
    regionCells.forEach(cell => {
      regionGrid[cell.row][cell.col] = regionIndex
    })
  })

  const borders: Border[] = []
  const cells = getAllCells(gridSize)
  cells.forEach(({ row, col }) => {
    // right border
    if (col + 1 < gridSize && regionGrid[row][col] !== regionGrid[row][col + 1]) {
      borders.push({
        x1: (col + 1) * cellSize + 1,
        y1: row * cellSize + 1,
        x2: (col + 1) * cellSize + 1,
        y2: (row + 1) * cellSize + 1,
      })
    }
    // bottom border
    if (row + 1 < gridSize && regionGrid[row][col] !== regionGrid[row + 1][col]) {
      borders.push({
        x1: col * cellSize + 1,
        y1: (row + 1) * cellSize + 1,
        x2: (col + 1) * cellSize + 1,
        y2: (row + 1) * cellSize + 1,
      })
    }
  })

  return (
    <g className="stroke-white">
      <line x1="0" y1="1" x2={gridSize * cellSize + 2} y2="1" />
      <line x1="1" y1="0" x2="1" y2={gridSize * cellSize + 2} />
      <line x1="0" y1={gridSize * cellSize + 1} x2={gridSize * cellSize + 2} y2={gridSize * cellSize + 1} />
      <line x1={gridSize * cellSize + 1} y1="0" x2={gridSize * cellSize + 1} y2={gridSize * cellSize + 2} />
      {borders.map(({ x1, y1, x2, y2 }, index) => (
        <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  )
}

type BordersGraphicsProps = {
  gridSize: number
  regions: Region[]
  cellSize: number
}

const ThermoGraphics = ({ thermo, cellSize }: { thermo: Thermo, cellSize: number }) => {
  const half = cellSize / 2
  const strokeWidth = cellSize / 3
  const bulb = thermo[0]
  const bulbRadius = Math.floor(half * 21 / 28)

  const points = thermo.map((cell, index) => {
    let x: number = cell.col * cellSize + half + 1
    let y: number = cell.row * cellSize + half + 1
    if (index > 0 && index === thermo.length - 1) {
      const prevCell = thermo[index - 1]
      const dirX = Math.sign(cell.col - prevCell.col)
      const dirY = Math.sign(cell.row - prevCell.row)
      x += dirX * half / 5
      y += dirY * half / 5
    }
    return `${x},${y}`
  }).join(' ')

  return (
    <g className="fill-gray-500 stroke-gray-500 opacity-80">
      <circle cx={bulb.col * cellSize + 1 + half}
              cy={bulb.row * cellSize + 1 + half}
              r={bulbRadius} />
      <polyline
        points={points}
        style={{
          fill: 'none',
          strokeWidth,
          strokeLinecap: 'square',
        }}
      />
    </g>
  )
}

const ThermosGraphics = ({ thermos, cellSize }: { thermos: Thermo[], cellSize: number }) => (
  <>
    {thermos.map((thermo, index) => (
      <ThermoGraphics key={index} thermo={thermo} cellSize={cellSize} />
    ))}
  </>
)

const NotesGraphics = ({ notes, cellSize }: { notes?: number[][][], cellSize: number }) => {
  if (!notes) {
    return null
  }

  const notesFontSize = cellSize * 3 / 14
  const notesPadding = cellSize / 14
  const notesFontWidth = notesFontSize * 2 / 3
  const notesSize = cellSize - notesPadding * 2
  const notesColumnSize = notesSize / 3

  const noteElements: ReactElement[] = []
  notes.forEach((rowNotes, rowIndex) => {
    rowNotes.forEach((cellNotes, colIndex) => {
      cellNotes.forEach(value => {
        const noteRow = Math.floor((value - 1) / 3)
        const noteCol = (value - 1) % 3

        const x = colIndex * cellSize + 1 + noteCol * notesColumnSize + notesPadding + notesColumnSize / 2 - notesFontWidth / 2
        const y = rowIndex * cellSize + 1 + noteRow * notesColumnSize + notesPadding + notesFontSize
        const key = value + 10 * (colIndex + rowIndex * rowNotes.length)
        noteElements.push((
          <text x={x}
                y={y}
                key={key}>
            {value}
          </text>
        ))
      })
    })
  })

  return (
    <g className="fill-blue-200 font-bold" style={{ stroke: 'none', fontSize: notesFontSize }}>
      {noteElements}
    </g>
  )
}

const DigitGraphics = ({ cellSize, constraints, grid, checkErrors }: DigitGraphicsProps) => {
  const { gridSize, fixedNumbers } = constraints
  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)
  const errorGrid = useErrorGrid(checkErrors, constraints, grid)

  const digitFontSize = cellSize * 9 / 14
  const digitFontHeight = digitFontSize * 2 / 3

  const digitElements: ReactElement[] = []
  const cells = getAllCells(gridSize)
  cells.forEach(({ row, col }) => {
    const value = fixedNumbersGrid[row][col] || grid?.[row][col]
    if (!value) {
      return
    }

    const x = col * cellSize + 1 + cellSize / 2
    const y = row * cellSize + 1 + cellSize / 2 + digitFontHeight / 2
    const key = row * gridSize + col

    const hasError = checkErrors && errorGrid[row][col]
    const isFixed = !_.isNil(fixedNumbersGrid[row][col])
    digitElements.push((
      <text x={x}
            y={y}
            key={key}
            textAnchor="middle"
            className={classNames({
              'fill-white': !hasError && !isFixed,
              'fill-gray-400': !hasError && isFixed,
              'fill-red-600': hasError,
            })}>
        {value}
      </text>
    ))
  })

  return (
    <g className="font-medium"
       style={{ stroke: 'none', fontSize: digitFontSize }}>
      {digitElements}
    </g>
  )
}

type DigitGraphicsProps = {
  cellSize: number
  constraints: SudokuConstraints
  grid?: Grid
  checkErrors: boolean
}

const GridGraphics = ({ gridSize, cellSize }: GridGraphicsProps) => {
  const gridLines: Border[] = []
  for (let row = 0; row < gridSize - 1; row++) {
    gridLines.push({
      x1: 1,
      y1: 1 + cellSize * (row + 1),
      x2: 1 + cellSize * gridSize,
      y2: 1 + cellSize * (row + 1),
    })
  }
  for (let col = 0; col < gridSize - 1; col++) {
    gridLines.push({
      x1: 1 + cellSize * (col + 1),
      y1: 1,
      x2: 1 + cellSize * (col + 1),
      y2: 1 + cellSize * gridSize,
    })
  }

  return (
    <g className="stroke-gray-700">
      {gridLines.map(({ x1, y1, x2, y2 }, index) => (
        <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  )
}

type GridGraphicsProps = {
  gridSize: number
  cellSize: number
}

const SelectedCellGraphics = ({ cellSize, selectedCell }: SelectedCellGraphicsProps) => (
  <>
    {selectedCell && (
      <rect x={1 + cellSize * selectedCell.col}
            y={1 + cellSize * selectedCell.row}
            width={cellSize}
            height={cellSize}
            className="opacity-25 stroke-white fill-white"
      />
    )}
  </>
)

type SelectedCellGraphicsProps = {
  cellSize: number
  selectedCell?: CellPosition | null
}

const useOnGridClick = (cellSize: number, onCellClick: Function | null) => (
  useCallback((e: MouseEvent) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const row = Math.floor(Math.max(0, y - 1) / cellSize)
    const col = Math.floor(Math.max(0, x - 1) / cellSize)
    onCellClick?.({ row, col })
  }, [cellSize, onCellClick])
)

const DiagonalGraphics = ({ gridSize, cellSize, primary, secondary }: DiagonalGraphicsProps) => (
  <g className="stroke-purple-400 stroke-[3px]">
    {primary && (
      <line x1={1} y1={1} x2={1 + cellSize * gridSize} y2={1 + cellSize * gridSize} />
    )}
    {secondary && (
      <line x1={1} y1={1 + cellSize * gridSize} x2={1 + cellSize * gridSize} y2={1} />
    )}
  </g>
)

type DiagonalGraphicsProps = {
  gridSize: number
  cellSize: number
  primary: boolean
  secondary: boolean
}

const SudokuConstraintsGraphics = (
  { constraints, notes, cellSize, grid, checkErrors, selectedCell, onCellClick }: SudokuConstraintsGraphicsProps
) => {
  const { gridSize, regions, thermos } = constraints
  const onGridClick = useOnGridClick(cellSize, onCellClick)

  return (
    <svg height={gridSize * cellSize + 2}
         width={gridSize * cellSize + 2}
         style={{ top: 0, left: 0, stroke: 'black', strokeWidth: 2 }}
         onClick={onGridClick}
    >
      <SelectedCellGraphics cellSize={cellSize} selectedCell={selectedCell} />
      <ThermosGraphics thermos={thermos || []} cellSize={cellSize} />
      <DiagonalGraphics gridSize={gridSize}
                        cellSize={cellSize}
                        primary={constraints.primaryDiagonal}
                        secondary={constraints.secondaryDiagonal} />
      <GridGraphics gridSize={gridSize} cellSize={cellSize} />
      <BordersGraphics gridSize={gridSize} regions={regions} cellSize={cellSize} />
      <DigitGraphics cellSize={cellSize} constraints={constraints} grid={grid} checkErrors={checkErrors} />
      <NotesGraphics notes={notes} cellSize={cellSize} />
    </svg>
  )
}

type SudokuConstraintsGraphicsProps = {
  constraints: SudokuConstraints
  notes?: number[][][]
  cellSize: number
  grid?: Grid
  checkErrors: boolean
  selectedCell?: CellPosition | null
  onCellClick: Function | null
}

export default SudokuConstraintsGraphics
