import { ReactElement, MouseEvent, useCallback, SVGProps } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { Arrow, CellNotes, CellPosition, Grid, KillerCage, KropkiDot, KropkiDotType, Region, SudokuConstraints, Thermo } from 'src/types/sudoku'
import { getAllCells } from 'src/utils/sudoku'
import { useGridErrors, useFixedNumbersGrid, useNoteErrors } from './hooks'

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
    <g className="thermo fill-gray-500 stroke-gray-500 opacity-80">
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

const ArrowGraphics = ({ arrow, cellSize }: { arrow: Arrow, cellSize: number }) => {
  const half = cellSize / 2
  const strokeWidth = cellSize / 15
  const margin = strokeWidth / 2

  let circleRect: SVGProps<SVGRectElement> | undefined
  if (arrow.circleCells.length > 0) {
    const circleMinRow = _.minBy(arrow.circleCells, 'row')!.row
    const circleMaxRow = _.maxBy(arrow.circleCells, 'row')!.row
    const circleMinCol = _.minBy(arrow.circleCells, 'col')!.col
    const circleMaxCol = _.maxBy(arrow.circleCells, 'col')!.col
    circleRect = {
      x: circleMinCol * cellSize + 1 + strokeWidth / 2 + margin,
      y: circleMinRow * cellSize + 1 + strokeWidth / 2 + margin,
      width: (circleMaxCol - circleMinCol + 1) * cellSize - strokeWidth - 2 * margin,
      height: (circleMaxRow - circleMinRow + 1) * cellSize - strokeWidth - 2 * margin,
      rx: cellSize / 2,
      ry: cellSize / 2,
    }
  }

  const firstCell = arrow.arrowCells[0]
  let closestCircleCell
  if (firstCell) {
    closestCircleCell = _.minBy(arrow.circleCells, cell => (
      (firstCell.row - cell.row) ** 2 + (firstCell.col - cell.col) ** 2
    ))
  }

  const lineCells: CellPosition[] = []
  if (closestCircleCell) {
    lineCells.push(closestCircleCell)
  }
  lineCells.push(...arrow.arrowCells)

  const points = lineCells.map((cell, index) => {
    let x: number = cell.col * cellSize + half + 1
    let y: number = cell.row * cellSize + half + 1
    if (index === 0 && index < lineCells.length - 1) {
      const nextCell = lineCells[index + 1]
      const dirX = Math.sign(nextCell.col - cell.col)
      const dirY = Math.sign(nextCell.row - cell.row)
      x += dirX * (half - margin)
      y += dirY * (half - margin)
      // Diagonal arrow starts need to be longer to be connected to the circle
      if (dirX !== 0 && dirY !== 0) {
        x -= dirX * cellSize / 6
        y -= dirY * cellSize / 6
      }
    } else if (index > 0 && index === lineCells.length - 1) {
      const prevCell = lineCells[index - 1]
      const dirX = Math.sign(cell.col - prevCell.col)
      const dirY = Math.sign(cell.row - prevCell.row)
      x += dirX * half * 1 / 2
      y += dirY * half * 1 / 2
    }
    return {
      x,
      y,
    }
  })

  // Arrow shape
  let arrowShapeSvgPoints = ''
  if (points.length >= 2) {
    const lastPoint = points[points.length - 1]
    const prevPoint = points[points.length - 2]
    const dy = prevPoint.y - lastPoint.y
    const dx = prevPoint.x - lastPoint.x
    // -dy because y axis is inverted
    const angle = Math.atan2(-dy, dx)
    const arrowLength = half * 3 / 4
    const angleDelta = Math.PI / 5
    const leftAngle = angle - angleDelta
    const leftX = lastPoint.x + Math.cos(leftAngle) * arrowLength
    const leftY = lastPoint.y - Math.sin(leftAngle) * arrowLength
    const rightAngle = angle + angleDelta
    const rightX = lastPoint.x + Math.cos(rightAngle) * arrowLength
    const rightY = lastPoint.y - Math.sin(rightAngle) * arrowLength

    const arrowShapePoints = [
      {
        x: leftX,
        y: leftY,
      },
      lastPoint,
      {
        x: rightX,
        y: rightY,
      }
    ]
    arrowShapeSvgPoints = arrowShapePoints.map(({ x, y }) => `${x},${y}`).join(' ')
  }

  const svgPoints = points.map(({ x, y }) => `${x},${y}`).join(' ')

  return (
    <g className="arrow fill-none stroke-gray-500 opacity-80" style={{
      strokeWidth,
    }}>
      {circleRect && (
        <rect {...circleRect} />
      )}
      <polyline points={svgPoints} />
      {arrowShapeSvgPoints.length > 0 && (
        <polyline points={arrowShapeSvgPoints} />
      )}
    </g>
  )
}

const ArrowsGraphics = ({ arrows, cellSize }: { arrows: Arrow[], cellSize: number }) => (
  <>
    {arrows.map((arrow, index) => (
      <ArrowGraphics key={index} arrow={arrow} cellSize={cellSize} />
    ))}
  </>
)

const NotesGraphics = ({ cellSize, constraints, notes, grid, fixedNumbersGrid, killerActive, checkErrors }: NotesGraphicsProps) => {
  const noteErrors: Set<number>[][] = useNoteErrors(checkErrors, constraints, grid, notes)

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
  notes.forEach((rowNotes, row) => {
    rowNotes.forEach((cellNotes, col) => {
      const value = fixedNumbersGrid[row][col] || grid?.[row][col]
      if (value) {
        return
      }
      cellNotes.forEach(value => {
        const hasError = checkErrors && noteErrors[row][col].has(value)
        const noteRow = Math.floor((value - 1) / 3)
        const noteCol = (value - 1) % 3
        const x = col * cellSize + 1 + noteCol * notesColumnWidth + notesPaddingX + notesColumnWidth / 2 - notesFontWidth / 2
        const y = row * cellSize + 1 + noteRow * notesColumnHeight + notesPaddingY + notesFontSize
        const key = value + 10 * (col + row * rowNotes.length)

        noteElements.push((
          <text x={x}
                y={y}
                key={key}
                className={classNames({'fill-red-600': hasError })}>
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
  constraints: SudokuConstraints
  notes?: number[][][]
  grid?: Grid
  fixedNumbersGrid: Grid
  cellSize: number
  killerActive: boolean
  checkErrors: boolean
}

const DigitGraphics = ({ cellSize, constraints, notes, grid, fixedNumbersGrid, checkErrors }: DigitGraphicsProps) => {
  const gridSize = constraints.gridSize
  const errorGrid = useGridErrors(checkErrors, constraints, grid, notes)

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
  notes?: CellNotes[][]
  fixedNumbersGrid: Grid
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

const SelectedCellGraphics = ({ cellSize, selectedCells }: SelectedCellGraphicsProps) => (
  <>
    {selectedCells.map((selectedCell: CellPosition, index: number) => (
      <rect x={1 + cellSize * selectedCell.col}
            y={1 + cellSize * selectedCell.row}
            width={cellSize}
            height={cellSize}
            className="opacity-25 stroke-white fill-white"
            key={index}
      />
    ))}
  </>
)

type SelectedCellGraphicsProps = {
  cellSize: number
  selectedCells: CellPosition[]
}

const useOnGridClick = (cellSize: number, onCellClick: Function | null) => (
  useCallback((e: MouseEvent) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const row = Math.floor(Math.max(0, y - 1) / cellSize)
    const col = Math.floor(Math.max(0, x - 1) / cellSize)
    const ctrl = e.metaKey || e.ctrlKey || e.shiftKey
    const doubleClick = e.detail === 2
    onCellClick?.({ row, col }, ctrl, true, doubleClick)
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

const ExtraRegionsGraphics = ({ cellSize, extraRegions }: ExtraRegionsGraphicsProps) => (
  <g className="extra-regions stroke-0 fill-cyan-900">
    {extraRegions.flat().map((cell, index) => (
      <rect x={1 + cellSize * cell.col}
            y={1 + cellSize * cell.row}
            width={cellSize}
            height={cellSize}
            key={index}
      />
    ))}
  </g>
)

type ExtraRegionsGraphicsProps = {
  cellSize: number
  extraRegions: Region[]
}

const OddGraphics = ({ cellSize, cells }: OddGraphicsProps) => {
  const half = cellSize / 2
  const radius = Math.floor(half * 21 / 28)

  return (
    <g className="odd-cells fill-gray-600 stroke-gray-600">
      {cells.map((cell, index) => (
        <circle cx={cell.col * cellSize + 1 + half}
                cy={cell.row * cellSize + 1 + half}
                r={radius}
                key={index} />
      ))}
    </g>
  )
}

type OddGraphicsProps = {
  cellSize: number
  cells: CellPosition[]
}

const EvenGraphics = ({ cellSize, cells }: EvenGraphicsProps) => {
  const PADDING = 7
  const sideLength = cellSize - 2 * PADDING

  return (
    <g className="even-cells fill-gray-600 stroke-gray-600">
      {cells.map((cell, index) => (
        <rect x={1 + cellSize * cell.col + PADDING}
              y={1 + cellSize * cell.row + PADDING}
              width={sideLength}
              height={sideLength}
              key={index} />
      ))}
    </g>
  )
}

type EvenGraphicsProps = {
  cellSize: number
  cells: CellPosition[]
}


const SudokuConstraintsGraphics = (
  { cellSize, constraints, notes, grid, checkErrors, selectedCells, onCellClick }: SudokuConstraintsGraphicsProps
) => {
  const {
    gridSize, fixedNumbers, regions, thermos, arrows, killerCages, kropkiDots, extraRegions,
    oddCells, evenCells,
  } = constraints
  const onGridClick = useOnGridClick(cellSize, onCellClick)
  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)

  return (
    <svg height={gridSize * cellSize + 2}
         width={gridSize * cellSize + 2}
         style={{ top: 0, left: 0, stroke: 'black', strokeWidth: 2 }}
         onClick={onGridClick}
    >
      <ExtraRegionsGraphics cellSize={cellSize} extraRegions={extraRegions ?? []} />
      <SelectedCellGraphics cellSize={cellSize} selectedCells={selectedCells} />
      <KillerGraphics killerCages={killerCages || []} gridSize={gridSize} cellSize={cellSize} />
      <ThermosGraphics thermos={thermos || []} cellSize={cellSize} />
      <ArrowsGraphics arrows={arrows || []} cellSize={cellSize} />
      <OddGraphics cellSize={cellSize} cells={oddCells ?? []} />
      <EvenGraphics cellSize={cellSize} cells={evenCells ?? []} />
      <DiagonalGraphics gridSize={gridSize}
                        cellSize={cellSize}
                        primary={constraints.primaryDiagonal}
                        secondary={constraints.secondaryDiagonal} />
      <GridGraphics gridSize={gridSize} cellSize={cellSize} />
      <BordersGraphics gridSize={gridSize} regions={regions} cellSize={cellSize} />
      <DigitGraphics cellSize={cellSize} constraints={constraints} notes={notes} grid={grid} fixedNumbersGrid={fixedNumbersGrid} checkErrors={checkErrors} />
      <NotesGraphics cellSize={cellSize} constraints={constraints} notes={notes} grid={grid} fixedNumbersGrid={fixedNumbersGrid} killerActive={!_.isEmpty(killerCages)} checkErrors={checkErrors} />
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
  selectedCells: CellPosition[]
  onCellClick: Function | null
}

export default SudokuConstraintsGraphics
