import _ from 'lodash'
import { ReactElement } from 'react'
import { CellPosition } from 'src/types/sudoku'
import { Region, SudokuConstraints, Thermo } from 'src/types/sudoku'

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

  const cells: CellPosition[] = _.flatten(
    _.times(gridSize, rowIndex => (
      _.times(gridSize, colIndex => (
        {
          row: rowIndex,
          col: colIndex,
        }
      ))
    ))
  )

  const borders: Border[] = []
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

  // Note: mix-blend-difference for light mode
  return (
    <g className="fill-gray-200 stroke-gray-200 mix-blend-luminosity" style={{ opacity: 0.4 }}>
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
    <g className="fill-blue-200" style={{ strokeWidth: 0.1, stroke: 'none', fontSize: notesFontSize }}>
      {noteElements}
    </g>
  )
}

const SudokuConstraintsGraphics = ({ constraints, notes, cellSize }: SudokuConstraintsGraphicsProps) => {
  const { gridSize, regions, thermos } = constraints

  return (
    <svg className="absolute pointer-events-none"
         height={gridSize * cellSize + 2}
         width={gridSize * cellSize + 2}
         style={{ top: 0, left: 0, stroke: 'black', strokeWidth: 2 }}
    >
      <BordersGraphics gridSize={gridSize} regions={regions} cellSize={cellSize} />
      <ThermosGraphics thermos={thermos || []} cellSize={cellSize} />
      <NotesGraphics notes={notes} cellSize={cellSize} />
    </svg>
  )
}

type SudokuConstraintsGraphicsProps = {
  constraints: SudokuConstraints
  notes?: number[][][]
  cellSize: number
}

export default SudokuConstraintsGraphics
