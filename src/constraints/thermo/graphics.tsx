import type { Thermo } from 'lisudoku-solver'
import type { ConstraintDefinition } from '../types'

interface ThermoGraphicProps {
  thermo: Thermo
  cellSize: number
}

const ThermoGraphic = ({ thermo, cellSize }: ThermoGraphicProps) => {
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
    <>
      <circle
        cx={bulb.col * cellSize + 1 + half}
        cy={bulb.row * cellSize + 1 + half}
        r={bulbRadius}
      />
      <polyline
        points={points}
        className="fill-none"
        style={{
          strokeWidth,
          strokeLinecap: 'square',
        }}
      />
    </>
  )
}

export const thermoGraphics: ConstraintDefinition['graphics'] = ({
  constraints, cellSize,
}) => (
  <g className="thermos fill-thermo stroke-thermo opacity-80">
    {(constraints.thermos ?? []).map((thermo, index) => (
      <ThermoGraphic
        key={index}
        thermo={thermo}
        cellSize={cellSize}
      />
    ))}
  </g>
)
