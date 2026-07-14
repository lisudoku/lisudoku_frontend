import { Card, CardBody } from 'src/design_system/Card'
import Typography from 'src/design_system/Typography'
import { detectNormalizedConstraintPresentations } from 'src/constraints/utils'
import type { SudokuConstraints } from 'lisudoku-solver'
import type { ReactNode } from 'react'

const computeRules = (constraints: SudokuConstraints): ReactNode[] => (
  [
    ...detectNormalizedConstraintPresentations(constraints)
      .filter(({ description }) => description !== null)
      .map(({ icon, description }) => (
        <>
          {icon}{' '}
          {description!({ constraints })}
        </>
      ))
  ]
)

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
