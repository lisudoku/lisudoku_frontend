import type { SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { exhaustiveGuard } from '../misc'
import { areaDisplay } from '../sudoku'

export const computeInvalidStateReason = (step: SolutionStep, constraints: SudokuConstraints) => {
  const reason = step.invalidStateReason!
  switch (reason.stateType) {
    case 'CellEmpty':
      return `${areaDisplay(reason.area, constraints)} is empty`
    case 'CellInvalidValue':
      return `${areaDisplay(reason.area, constraints)} has invalid digit ${reason.values[0]}`
    case 'CellNoCandidates':
      return `${areaDisplay(reason.area, constraints)} has no candidates left`
    case 'AreaValueConflict':
      return `${areaDisplay(reason.area, constraints)} has multiple ${reason.values[0]} digits`
    case 'AreaConstraint':
      return `${areaDisplay(reason.area, constraints)} constraints are not satisfied`
    case 'AreaCandidates':
      return `digits ${[...reason.values].sort().join(', ')} can't be placed in ${areaDisplay(reason.area, constraints)}`
    default:
      return exhaustiveGuard(reason.stateType)
  }
}
