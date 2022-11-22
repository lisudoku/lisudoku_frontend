import _ from 'lodash'
import { ReactElement } from 'react'
import { CellPosition } from 'src/types/sudoku'
import { Region, SudokuConstraints, Thermo } from 'src/types/sudoku'
import { CELL_SIZE, NOTES_COLUMN_SIZE, NOTES_FONT_SIZE, NOTES_FONT_WIDTH, NOTES_PADDING } from 'src/utils/constants'

type Border = {
  x1: number
  y1: number
  x2: number
  y2: number
}

const BordersGraphics = ({ gridSize, regions }: { gridSize: number, regions: Region[] }) => {
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
        x1: (col + 1) * CELL_SIZE + 1,
        y1: row * CELL_SIZE + 1,
        x2: (col + 1) * CELL_SIZE + 1,
        y2: (row + 1) * CELL_SIZE + 1,
      })
    }
    // bottom border
    if (row + 1 < gridSize && regionGrid[row][col] !== regionGrid[row + 1][col]) {
      borders.push({
        x1: col * CELL_SIZE + 1,
        y1: (row + 1) * CELL_SIZE + 1,
        x2: (col + 1) * CELL_SIZE + 1,
        y2: (row + 1) * CELL_SIZE + 1,
      })
    }
  })

  return (
    <g className="stroke-white">
      <line x1="0" y1="1" x2={gridSize * CELL_SIZE + 2} y2="1" />
      <line x1="1" y1="0" x2="1" y2={gridSize * CELL_SIZE + 2} />
      <line x1="0" y1={gridSize * CELL_SIZE + 1} x2={gridSize * CELL_SIZE + 2} y2={gridSize * CELL_SIZE + 1} />
      <line x1={gridSize * CELL_SIZE + 1} y1="0" x2={gridSize * CELL_SIZE + 1} y2={gridSize * CELL_SIZE + 2} />
      {borders.map(({ x1, y1, x2, y2 }, index) => (
        <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  )
}

const ThermoGraphics = ({ thermo }: { thermo: Thermo }) => {
  const half = CELL_SIZE / 2
  const strokeWidth = CELL_SIZE / 3
  const bulb = thermo[0]

  const points = thermo.map((cell, index) => {
    let x: number = cell.col * CELL_SIZE + half + 1
    let y: number = cell.row * CELL_SIZE + half + 1
    if (index === thermo.length - 1) {
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
      <circle cx={bulb.col * CELL_SIZE + 1 + half}
              cy={bulb.row * CELL_SIZE + 1 + half}
              r={half - 7} />
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

const ThermosGraphics = ({ thermos }: { thermos: Thermo[] }) => (
  <>
    {thermos.map((thermo, index) => (
      <ThermoGraphics key={index} thermo={thermo} />
    ))}
  </>
)

const NotesGraphics = ({ notes }: { notes: number[][][] }) => {
  const noteElements: ReactElement[] = []
  notes.forEach((rowNotes, rowIndex) => {
    rowNotes.forEach((cellNotes, colIndex) => {
      cellNotes.forEach(value => {
        const noteRow = Math.floor((value - 1) / 3)
        const noteCol = (value - 1) % 3

        const x = colIndex * CELL_SIZE + 1 + noteCol * NOTES_COLUMN_SIZE + NOTES_PADDING + NOTES_COLUMN_SIZE / 2 - NOTES_FONT_WIDTH / 2
        const y = rowIndex * CELL_SIZE + 1 + noteRow * NOTES_COLUMN_SIZE + NOTES_PADDING + NOTES_FONT_SIZE
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
    <g className="fill-blue-200" style={{ strokeWidth: 0.1, stroke: 'none', fontSize: NOTES_FONT_SIZE }}>
      {noteElements}
    </g>
  )
}

const SudokuConstraintsGraphics = ({ constraints, notes }: { constraints: SudokuConstraints, notes: number[][][] }) => {
  const { gridSize, regions, thermos } = constraints

  return (
    <svg className="absolute pointer-events-none"
         height={gridSize * CELL_SIZE + 2}
         width={gridSize * CELL_SIZE + 2}
         style={{ top: 0, left: 0, stroke: 'black', strokeWidth: 2 }}
    >
      <BordersGraphics gridSize={gridSize} regions={regions} />
      <ThermosGraphics thermos={thermos || []} />
      <NotesGraphics notes={notes} />
    </svg>
  )
}

export default SudokuConstraintsGraphics
