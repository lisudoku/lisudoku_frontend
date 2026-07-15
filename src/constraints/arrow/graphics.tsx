import type { Arrow, CellPosition } from 'lisudoku-solver'
import { ConstraintDefinition } from '../types'
import { maxBy, minBy } from 'lodash-es'
import type { SVGProps } from 'react'

const ArrowGraphic = ({ arrow, cellSize }: { arrow: Arrow, cellSize: number }) => {
  const half = cellSize / 2
  const strokeWidth = cellSize / 15
  const margin = strokeWidth / 2

  let circleRect: SVGProps<SVGRectElement> | undefined
  if (arrow.circleCells.length > 0) {
    const circleMinRow = minBy(arrow.circleCells, 'row')!.row
    const circleMaxRow = maxBy(arrow.circleCells, 'row')!.row
    const circleMinCol = minBy(arrow.circleCells, 'col')!.col
    const circleMaxCol = maxBy(arrow.circleCells, 'col')!.col
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
    closestCircleCell = minBy(arrow.circleCells, cell => (
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
    <g style={{ strokeWidth }}>
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

export const arrowGraphics: ConstraintDefinition['graphics'] = ({
  constraints, cellSize,
}) => (
  <g className="arrows fill-none stroke-arrow opacity-80">
    {(constraints.arrows ?? []).map((arrow, index) => (
      <ArrowGraphic
        key={index}
        arrow={arrow}
        cellSize={cellSize}
      />
    ))}
  </g>
)
