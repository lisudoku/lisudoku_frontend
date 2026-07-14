import { SudokuConstraints } from 'lisudoku-solver'
import { detectConstraintIcons } from 'src/constraints/utils'

export const PuzzleCardIcons = ({ constraints }: { constraints: SudokuConstraints }) => (
  <div className="flex gap-x-1">
    {detectConstraintIcons(constraints).map((constraintIcon, index) => (
      <span key={index}>{constraintIcon}</span>
    ))}
  </div>
)
