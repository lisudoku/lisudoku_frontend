import type { Area, CellPosition, SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { exhaustiveGuard } from '../misc'

export const cellDisplay = (cell: CellPosition) => (
  `R${cell.row + 1}C${cell.col + 1}`
)

// Returns how to refer to given area in hints and solver steps.
export const areaDisplay = (area: Area, constraints: SudokuConstraints): string => {
  if (area === 'PrimaryDiagonal') {
    return 'the negative diagonal'
  } else if (area === 'SecondaryDiagonal') {
    return 'the positive diagonal'
  } else if (area === 'Grid') {
    return 'the grid'
  }

  if (typeof area !== 'object') {
    return exhaustiveGuard(area)
  }

  if ('Row' in area) {
    return `row ${area.Row + 1}`
  } else if ('Column' in area) {
    return `column ${area.Column + 1}`
  } else if ('Region' in area) {
    if (area.Region >= constraints.gridSize) {
      return `extra region ${area.Region - constraints.gridSize + 1}`
    } else {
      return `box ${area.Region + 1}`
    }
  } else if ('Thermo' in area) {
    return 'a thermometer'
  } else if ('KillerCage' in area) {
    return 'a killer cage'
  } else if ('KropkiDot' in area) {
    const isNegative = constraints.kropkiNegative && area.KropkiDot >= (constraints.kropkiDots?.length ?? 0)
    return `a ${isNegative ? 'negative ' : ''}kropki dot pair`
  } else if ('Arrow' in area) {
    return 'an arrow'
  } else if ('Renban' in area) {
    return 'a renban'
  } else if ('Palindrome' in area) {
    return 'a palindrome'
  } else if ('Cell' in area) {
    return `cell ${cellDisplay({ row: area.Cell[0], col: area.Cell[1] })}`
  } else if ('Adhoc' in area) {
    return `adhoc set of cells ${area.Adhoc.map((cell: CellPosition) => cellDisplay(cell)).join(', ')}`
  }

  return exhaustiveGuard(area)
}

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
