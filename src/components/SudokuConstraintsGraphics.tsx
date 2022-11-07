import _ from 'lodash'
import { CellPosition } from 'src/types/common'
import { Region } from 'src/types/constraints'
import { CELL_SIZE } from 'src/utils/constants'

type Border = {
  x1: number
  y1: number
  x2: number
  y2: number
}

const SudokuConstraintsGraphics = ({ gridSize, regions }: { gridSize: number, regions: Region[] }) => {
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
    <svg className="absolute pointer-events-none"
          height={gridSize * CELL_SIZE + 2}
          width={gridSize * CELL_SIZE + 2}
          style={{ top: 0, left: 0, stroke: 'black', strokeWidth: 2 }}
    >
      <line x1="0" y1="1" x2={gridSize * CELL_SIZE + 2} y2="1" />
      <line x1="1" y1="0" x2="1" y2={gridSize * CELL_SIZE + 2} />
      <line x1="0" y1={gridSize * CELL_SIZE + 1} x2={gridSize * CELL_SIZE + 2} y2={gridSize * CELL_SIZE + 1} />
      <line x1={gridSize * CELL_SIZE + 1} y1="0" x2={gridSize * CELL_SIZE + 1} y2={gridSize * CELL_SIZE + 2} />
      {borders.map(({ x1, y1, x2, y2 }, index) => (
        <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </svg>
  )
}

export default SudokuConstraintsGraphics
