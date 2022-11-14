import _ from 'lodash'
import { SudokuConstraints } from 'src/types/constraints'
import { wasm_intuitive_solve } from 'lisudoku-solver'
import { useState } from 'react'
import { SolutionStep } from 'src/types/wasm'

const solveSudoku = (constraints: SudokuConstraints) => {
  const wasm_constraints = _.mapKeys(constraints, (_value, key) => _.snakeCase(key))
  const solution = wasm_intuitive_solve(wasm_constraints)
  return solution
}

const groupStepsByType = (steps: SolutionStep[]) => {
  const groups: { [index: string]: number } = {}
  for (const step of steps) {
    groups[step.rule] ||= 0
    groups[step.rule] += 1
  }

  return _.toPairs(groups);
}

const SolveButton = ({ constraints }: { constraints: SudokuConstraints }) => {
  const [ steps, setSteps ] = useState<SolutionStep[]>()
  const handleClick = () => {
    const solution = solveSudoku(constraints)
    console.log(solution)
    setSteps(solution.steps)
  }
  
  return (
    <>
      <button className="border ml-5" onClick={handleClick}>Solve</button>
      <div>
        {steps && groupStepsByType(steps).map((group, index) => (
          <span key={index}>
            {`${group[0]} - ${group[1]}; `}
          </span>
        ))}
        {steps && steps.map((step, index) => (
          <div key={index}>
            <span>
              {step.rule}
            </span>
            <span>
              {` (${step.cells[0].row},${step.cells[0].col}) value ${step.values[0]}`}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

export default SolveButton
