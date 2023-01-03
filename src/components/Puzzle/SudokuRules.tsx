import { Card, CardBody, Typography } from '@material-tailwind/react'
import _ from 'lodash'
import { SudokuConstraints } from 'src/types/sudoku'

const computeRules = (constraints: SudokuConstraints) => {
  const rules = []
  rules.push(
    `Place a digit from 1 to ${constraints.gridSize} in each of the empty cells so ` +
    `that each digit appears exactly once in each row, column and outlined region.`
  )
  if (!_.isEmpty(constraints.thermos)) {
    rules.push('Each thermometer contains digits in increasing order from the bulb to the end.')
  }
  if (constraints.primaryDiagonal || constraints.secondaryDiagonal) {
    let rule
    if (constraints.primaryDiagonal && constraints.secondaryDiagonal) {
      rule = 'Each'
    } else {
      rule = 'The'
    }
    rule += ` purple diagonal must contain distinct digits from 1 to ${constraints.gridSize}.`
    rules.push(rule)
  }
  if (constraints.antiKnight) {
    rules.push('Cells a knight move away must not contain the same digit.')
  }
  return rules
}

const SudokuRules = ({ constraints }: { constraints: SudokuConstraints }) => (
  <>
    <Card color="gray" className="rounded w-full">
      <CardBody>
        <Typography variant="h6">
          Rules
        </Typography>
        <ul className="list-disc pl-3">
          {computeRules(constraints).map((rule, index) => (
            <li key={index}><Typography variant="small">{rule}</Typography></li>
          ))}
        </ul>
      </CardBody>
    </Card>
  </>
)

export default SudokuRules
