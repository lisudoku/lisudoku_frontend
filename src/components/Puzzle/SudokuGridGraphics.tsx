import { ReactElement, MouseEvent, useCallback } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { CellPosition, Grid, KillerCage, KropkiDot, KropkiDotType, Region, SudokuConstraints, Thermo } from 'src/types/sudoku'
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
    <g className="regions stroke-white">
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

const NotesGraphics = ({ notes, cellSize, killerActive }: NotesGraphicsProps) => {
  if (!notes) {
    return null
  }

  const notesPaddingX = cellSize / 14 + (killerActive ? 3 : 0)
  const notesPaddingY = cellSize / 14 + (killerActive ? 10 : 0)
  const notesFontSize = cellSize * 3 / 14
  const notesFontWidth = notesFontSize * 2 / 3
  const notesWidth = cellSize - notesPaddingX * 2
  const notesHeight = cellSize - notesPaddingY * 2
  const notesColumnWidth = notesWidth / 3
  const notesColumnHeight = notesHeight / 3

  const noteElements: ReactElement[] = []
  notes.forEach((rowNotes, rowIndex) => {
    rowNotes.forEach((cellNotes, colIndex) => {
      cellNotes.forEach(value => {
        const noteRow = Math.floor((value - 1) / 3)
        const noteCol = (value - 1) % 3

        const x = colIndex * cellSize + 1 + noteCol * notesColumnWidth + notesPaddingX + notesColumnWidth / 2 - notesFontWidth / 2
        const y = rowIndex * cellSize + 1 + noteRow * notesColumnHeight + notesPaddingY + notesFontSize
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
    <g className="notes fill-blue-200 font-bold" style={{ stroke: 'none', fontSize: notesFontSize }}>
      {noteElements}
    </g>
  )
}

type NotesGraphicsProps = {
  notes?: number[][][]
  cellSize: number
  killerActive: boolean
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
    <g className="digits font-medium"
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
    <g className="grid-lines stroke-gray-700">
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
  <g className="diagonals stroke-purple-400 stroke-[3px]">
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

type KillerSum = {
  sum: number | null
  x: number
  y: number
}

// TODO: we could use a single polyline per killer cage
const KillerGraphics = ({ gridSize, cellSize, killerCages }: KillerGraphicsProps) => {
  const KILLER_PADDING = cellSize / 15
  const KILLER_SUM_FONT_SIZE = cellSize * 3 / 14

  const cagesGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
  killerCages.forEach((killerCage, killerIndex) => {
    killerCage.region.forEach(cell => {
      cagesGrid[cell.row][cell.col] = killerIndex + 1
    })
  })

  const borders: Border[] = []
  const cells = getAllCells(gridSize)
  cells.forEach(({ row, col }) => {
    if (cagesGrid[row][col] === 0) {
      return
    }

    const ADJACENT_ROW_DELTA = [ 0, 1, 0, -1 ]
    const ADJACENT_COL_DELTA = [ 1, 0, -1, 0 ]
    for (let dir = 0; dir < 4; dir++) {
      const drow = row + ADJACENT_ROW_DELTA[dir]
      const dcol = col + ADJACENT_COL_DELTA[dir]

      if (cagesGrid[row][col] !== 0 && (
            drow < 0 || drow >= gridSize || dcol < 0 || dcol >= gridSize ||
            cagesGrid[row][col] !== cagesGrid[drow][dcol]
          )
      ) {
        borders.push({
          x1: col * cellSize + 1 + KILLER_PADDING + (dcol > col ? (cellSize - 2 * KILLER_PADDING) : 0),
          y1: row * cellSize + 1 + KILLER_PADDING + (drow > row ? (cellSize - 2 * KILLER_PADDING) : 0),
          x2: col * cellSize + 1 + KILLER_PADDING + (dcol < col ? 0 : (cellSize - 2 * KILLER_PADDING)),
          y2: row * cellSize + 1 + KILLER_PADDING + (drow < row ? 0 : (cellSize - 2 * KILLER_PADDING)),
        })
      }
    }

    const DIAGONAL_ROW_DELTA = [ 1, 1, -1, -1 ]
    const DIAGONAL_COL_DELTA = [ 1, -1, 1, -1 ]
    for (let dir = 0; dir < 4; dir++) {
      const drow = row + DIAGONAL_ROW_DELTA[dir]
      const dcol = col + DIAGONAL_COL_DELTA[dir]

      if (cagesGrid[row][col] !== 0 &&
          drow >= 0 && drow < gridSize && dcol >= 0 && dcol < gridSize &&
          cagesGrid[drow][dcol] !== cagesGrid[row][col] &&
          cagesGrid[row][dcol] === cagesGrid[row][col] &&
          cagesGrid[drow][col] === cagesGrid[row][col]) {
        // vertical
        borders.push({
          x1: col * cellSize + 1 + KILLER_PADDING + (dcol > col ? (cellSize - 2 * KILLER_PADDING) : 0),
          y1: row * cellSize + 1 + (drow > row ? (cellSize - KILLER_PADDING) : 0),
          x2: col * cellSize + 1 + KILLER_PADDING + (dcol > col ? (cellSize - 2 * KILLER_PADDING) : 0),
          y2: row * cellSize + 1 + KILLER_PADDING + (drow > row ? (cellSize - KILLER_PADDING) : 0),
        })
        // horizontal
        borders.push({
          x1: col * cellSize + 1 + (dcol > col ? (cellSize - KILLER_PADDING) : 0),
          y1: row * cellSize + 1 + KILLER_PADDING + (drow > row ? (cellSize - 2 * KILLER_PADDING) : 0),
          x2: col * cellSize + 1 + KILLER_PADDING + (dcol > col ? (cellSize - KILLER_PADDING) : 0),
          y2: row * cellSize + 1 + KILLER_PADDING + (drow > row ? (cellSize - 2 * KILLER_PADDING) : 0),
        })
      }
    }
  })

  const killerSums: KillerSum[] = killerCages.map(killerCage => {
    const cell = killerCage.region[0]
    return {
      sum: killerCage.sum,
      x: cell.col * cellSize + 1 + 1 + KILLER_PADDING,
      y: cell.row * cellSize + 1 + KILLER_PADDING,
    }
  })

  return (
    <>
    <g className="killer-cage-borders stroke-white stroke-2" style={{ strokeDasharray: cellSize / 10 }}>
      {borders.map(({ x1, y1, x2, y2 }, index) => (
        <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
    <g className="killer-cage-sums stroke-0 fill-white font-bold" style={{ fontSize: KILLER_SUM_FONT_SIZE }}>
      {killerSums.map(({ sum, x, y }, index) => (
        <text key={index} x={x} y={y} dominantBaseline="text-before-edge">{sum}</text>
      ))}
    </g>
    </>
  )
}

type KillerGraphicsProps = {
  gridSize: number
  cellSize: number
  killerCages: KillerCage[]
}

type KropkiCircle = {
  x: number
  y: number
  fill: string
}

const KropkiGraphics = ({ kropkiDots, cellSize }: KropkiGraphicsProps) => {
  const KROPKI_CIRCLE_RADIUS = cellSize / 9

  const circles: KropkiCircle[] = kropkiDots.map(kropkiDot => ({
    x: 1 + (kropkiDot.cell1.col + kropkiDot.cell2.col + 1) / 2 * cellSize,
    y: 1 + (kropkiDot.cell1.row + kropkiDot.cell2.row + 1) / 2 * cellSize,
    fill: kropkiDot.dotType === KropkiDotType.Consecutive ? 'white' : 'black',
  }))

  return (
    <g className="kropki-dots" stroke="white" strokeWidth="1.5">
      {circles.map((circle, index) => (
        <circle key={index}
                cx={circle.x}
                cy={circle.y}
                r={KROPKI_CIRCLE_RADIUS}
                fill={circle.fill}
        />
      ))}
    </g>
  )
}

type KropkiGraphicsProps = {
  kropkiDots: KropkiDot[]
  cellSize: number
}

const SudokuConstraintsGraphics = (
  { constraints, notes, cellSize, grid, checkErrors, selectedCell, onCellClick }: SudokuConstraintsGraphicsProps
) => {
  const { gridSize, regions, thermos, killerCages, kropkiDots } = constraints
  const onGridClick = useOnGridClick(cellSize, onCellClick)

  return (
    <svg height={gridSize * cellSize + 2}
         width={gridSize * cellSize + 2}
         style={{ top: 0, left: 0, stroke: 'black', strokeWidth: 2 }}
         onClick={onGridClick}
    >
      <SelectedCellGraphics cellSize={cellSize} selectedCell={selectedCell} />
      <KillerGraphics killerCages={killerCages || []} gridSize={gridSize} cellSize={cellSize} />
      <ThermosGraphics thermos={thermos || []} cellSize={cellSize} />
      <DiagonalGraphics gridSize={gridSize}
                        cellSize={cellSize}
                        primary={constraints.primaryDiagonal}
                        secondary={constraints.secondaryDiagonal} />
      <GridGraphics gridSize={gridSize} cellSize={cellSize} />
      <BordersGraphics gridSize={gridSize} regions={regions} cellSize={cellSize} />
      <DigitGraphics cellSize={cellSize} constraints={constraints} grid={grid} checkErrors={checkErrors} />
      <NotesGraphics notes={notes} cellSize={cellSize} killerActive={!_.isEmpty(killerCages)} />
      <KropkiGraphics kropkiDots={kropkiDots || []} cellSize={cellSize} />
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
