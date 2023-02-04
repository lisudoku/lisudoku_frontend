import { Card, CardBody, Typography } from '@material-tailwind/react'
import _ from 'lodash'
import { SudokuConstraints } from 'src/types/sudoku'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThermometer4, faXmark, faChessKnight, faSquare } from '@fortawesome/free-solid-svg-icons'
import { faCircle, faCircleXmark } from '@fortawesome/free-regular-svg-icons'

const computeRules = (constraints: SudokuConstraints) => {
  const rules = []
  rules.push(
    `Place a digit from 1 to ${constraints.gridSize} in each of the empty cells so ` +
    `that each digit appears exactly once in each row, column and outlined region.`
  )
  if (!_.isEmpty(constraints.extraRegions)) {
    rules.push(<>
      <FontAwesomeIcon icon={faSquare} size="sm" className="text-cyan-700" />
      {' '}
      Each blue region contains each digit from 1 to {constraints.gridSize}.
    </>)
  }
  if (!_.isEmpty(constraints.thermos)) {
    rules.push(<>
      <FontAwesomeIcon icon={faThermometer4} size="sm"/>
      {' '}
      Each thermometer contains digits in increasing order from the bulb to the end.
    </>)
  }
  if (constraints.primaryDiagonal || constraints.secondaryDiagonal) {
    let rule
    if (constraints.primaryDiagonal && constraints.secondaryDiagonal) {
      rule = 'Each'
    } else {
      rule = 'The'
    }
    rule += ` purple diagonal must contain distinct digits from 1 to ${constraints.gridSize}.`
    rules.push(<>
      <FontAwesomeIcon icon={faXmark} size="lg"/>
      {' '}
      {rule}
    </>)
  }
  if (constraints.antiKnight) {
    rules.push(<>
      <FontAwesomeIcon icon={faChessKnight} size="sm"/>
      {' '}
      Cells a knight move away must not contain the same digit.
    </>)
  }
  if (!_.isEmpty(constraints.killerCages)) {
    rules.push(<>
      <svg height={13} width={13} className="inline-block">
        <rect x="0" y="0" width="100%" height="100%" fill="transparent" stroke="white" strokeDasharray="2" />
      </svg>
      {' '}
      The sum of all numbers in a cage must match the small number in the corner of the cage.
      No number appears more than once in a cage.
    </>)
  }
  if (!_.isEmpty(constraints.kropkiDots)) {
    rules.push(<>
      <FontAwesomeIcon icon={faCircle} size="sm"/>
      {' '}
      Adjacent cells containing digits whose difference is 1 are marked with a white circle.
      Adjacent cells containing digits whose ratio is 2 are marked with a black circle.
    </>)
    if (constraints.kropkiNegative) {
      rules.push(<>
        <FontAwesomeIcon icon={faCircleXmark} size="sm"/>
        {' '}
        Adjacent cells with no marking must not contain digits either whose difference is 1 or whose ratio is 2.
      </>)
    }
  }
  return rules
}

const SudokuRules = ({ constraints }: { constraints: SudokuConstraints }) => (
  <>
    <Card className="rounded w-full bg-gray-600 text-white">
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
