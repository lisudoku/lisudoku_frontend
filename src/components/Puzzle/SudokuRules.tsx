import { Card, CardBody } from 'src/shared/Card'
import Typography from 'src/shared/Typography'
import { ConstraintType } from 'src/types/sudoku'
import { detectConstraints } from 'src/utils/sudoku'
import { CONSTRAINTS_DISPLAY } from 'src/utils/constraints'
import { SudokuConstraints } from 'lisudoku-solver'

const computeRules = (constraints: SudokuConstraints) => {
  const rules = []
  rules.push(CONSTRAINTS_DISPLAY[ConstraintType.FixedNumber].description(constraints))

  const constraintTypes = detectConstraints(constraints).constraintTypes

  // Combine diagonals into a single rule
  if (constraintTypes.includes(ConstraintType.PrimaryDiagonal) &&
      constraintTypes.includes(ConstraintType.SecondaryDiagonal)) {
    constraintTypes.splice(
      constraintTypes.findIndex(constraintType => constraintType === ConstraintType.SecondaryDiagonal),
      1,
    )
    constraintTypes.splice(
      constraintTypes.findIndex(constraintType => constraintType === ConstraintType.PrimaryDiagonal),
      1,
      ConstraintType.Diagonals,
    )
  }

  const displayedConstraintTypes = constraintTypes.filter(
    constraintType => CONSTRAINTS_DISPLAY[constraintType].icon !== null
  )

  rules.push(...displayedConstraintTypes.map(constraintType => (
    <>
      {CONSTRAINTS_DISPLAY[constraintType].icon}{' '}
      {CONSTRAINTS_DISPLAY[constraintType].description(constraints)}
    </>
  )))

  return rules
}

const SudokuRules = ({ constraints }: { constraints: SudokuConstraints }) => (
  <>
    <Card className="w-full">
      <CardBody>
        <Typography variant="h6">
          Rules
        </Typography>
        <ul className="list-disc pl-3">
          {computeRules(constraints).map((rule, index) => (
            <li key={index}>
              <Typography variant="small">{rule}</Typography>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  </>
)

export default SudokuRules
