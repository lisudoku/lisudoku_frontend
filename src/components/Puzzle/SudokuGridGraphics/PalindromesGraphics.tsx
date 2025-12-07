import { Palindrome } from 'lisudoku-solver'

const PalindromeGraphics = ({ palindrome, cellSize }: { palindrome: Palindrome, cellSize: number }) => {
  const half = cellSize / 2
  const strokeWidth = cellSize / 4

  const points = palindrome.map((cell) => {
    let x: number = cell.col * cellSize + half + 1
    let y: number = cell.row * cellSize + half + 1
    return `${x},${y}`
  }).join(' ')

  // Note: Reusing thermo fill color

  return (
    <g className="palindrome fill-thermo stroke-thermo opacity-60">
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

const PalindromesGraphics = ({ palindromes, cellSize }: { palindromes: Palindrome[], cellSize: number }) => (
  <>
    {palindromes.map((palindrome, index) => (
      <PalindromeGraphics key={index} palindrome={palindrome} cellSize={cellSize} />
    ))}
  </>
)

export default PalindromesGraphics
