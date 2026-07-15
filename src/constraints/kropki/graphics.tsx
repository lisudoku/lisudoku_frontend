import { KropkiDot } from 'lisudoku-solver'
import type { ConstraintDefinition } from '../types'
import type { SVGProps } from 'react'
import classNames from 'classnames'

interface KropkiGraphicsProps {
  kropkiDots?: KropkiDot[]
  cellSize: number
  className: string
}

export const KropkiGraphics = ({ kropkiDots, cellSize, className }: KropkiGraphicsProps) => {
  const kropkiCircleRadius = cellSize / 9

  const circles: SVGProps<SVGCircleElement>[] = (kropkiDots ?? []).map(kropkiDot => ({
    x: 1 + (kropkiDot.cell1.col + kropkiDot.cell2.col + 1) / 2 * cellSize,
    y: 1 + (kropkiDot.cell1.row + kropkiDot.cell2.row + 1) / 2 * cellSize,
    fill: kropkiDot.dotType === 'Consecutive' ? 'white' : 'black',
  }))

  return (
    <g className={classNames(className, 'stroke-cell-border-strong')} strokeWidth="1.5">
      {circles.map((circle, index) => (
        <circle
          key={index}
          cx={circle.x}
          cy={circle.y}
          r={kropkiCircleRadius}
          fill={circle.fill}
        />
      ))}
    </g>
  )
}

export const kropkiConsecutiveGraphics: ConstraintDefinition['graphics'] = ({ constraints, cellSize }) => (
  <KropkiGraphics
    kropkiDots={constraints.kropkiDots?.filter(kropkiDot => kropkiDot.dotType === 'Consecutive')}
    cellSize={cellSize}
    className="kropki-dots-consecutive"
  />
)

export const kropkiDoubleGraphics: ConstraintDefinition['graphics'] = ({ constraints, cellSize }) => (
  <KropkiGraphics
    kropkiDots={constraints.kropkiDots?.filter(kropkiDot => kropkiDot.dotType === 'Double')}
    cellSize={cellSize}
    className="kropki-dots-double"
  />
)
