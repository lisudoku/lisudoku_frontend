import type { Palindrome } from 'lisudoku-solver'
import { ConstraintDefinition } from '../types'

interface PalindromeGraphicProps {
  palindrome: Palindrome
  cellSize: number
}

const PalindromeGraphic = ({ palindrome, cellSize }: PalindromeGraphicProps) => {
  const half = cellSize / 2
  const strokeWidth = cellSize / 4

  const points = palindrome.map((cell) => {
    let x: number = cell.col * cellSize + half + 1
    let y: number = cell.row * cellSize + half + 1
    return `${x},${y}`
  }).join(' ')

  return (
    <polyline
      points={points}
      style={{
        strokeWidth,
        strokeLinecap: 'square',
      }}
    />
  )
}

export const palindromeGraphics: ConstraintDefinition['graphics'] = ({
  constraints, cellSize,
}) => (
  // Note: Reusing thermo stroke color
  <g className="palindromes fill-none stroke-thermo opacity-60">
    {(constraints.palindromes ?? []).map((palindrome, index) => (
      <PalindromeGraphic
        key={index}
        palindrome={palindrome}
        cellSize={cellSize}
      />
    ))}
  </g>
)
