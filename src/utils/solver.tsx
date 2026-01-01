import { difference, flatten, intersection, last, uniqBy, values as _values } from 'lodash-es'
import ExternalLink from 'src/components/ExternalLink'
import { HintLevel } from 'src/reducers/puzzle'
import { CellMarks, Grid } from 'src/types/sudoku'
import { GRID_STEPS, StepRuleDisplay } from './constants'
import { pluralize } from './misc'
import { computeFixedNumbersGrid, getAllCells } from './sudoku'
import { DISCORD_INVITE_URL } from 'src/components/AppFooter/DiscordIcon'
import { Area, CellPosition, FixedNumber, SolutionStep, SudokuConstraints, SudokuLogicalSolveResult } from 'lisudoku-solver'

// Integrates grid contents into constraints' fixed_numbers
export const combineConstraintsWithGrid = (constraints: SudokuConstraints, grid: Grid) => {
  const { gridSize, fixedNumbers } = constraints
  const fixedNumbersGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
  const extraFixedNumbers: FixedNumber[] = []
  getAllCells(gridSize).forEach((cell: CellPosition) => {
    const fixedNumber = fixedNumbersGrid[cell.row][cell.col]
    const gridValue = grid[cell.row][cell.col]
    if (fixedNumber === null && gridValue !== null) {
      extraFixedNumbers.push({
        position: cell,
        value: gridValue,
      })
    }
  })

  return {
    ...constraints,
    fixedNumbers: [
      ...constraints.fixedNumbers ?? [],
      ...extraFixedNumbers,
    ]
  }
}

const cellDisplay = (cell: CellPosition) => (
  `R${cell.row + 1}C${cell.col + 1}`
)

// TODO: use an exhaustive switch, maybe once I add a linter
const areaDisplay = (area: Area, gridSize: number): string => {
  if (area === 'PrimaryDiagonal') {
    return 'the negative diagonal'
  } else if (area === 'SecondaryDiagonal') {
    return 'the positive diagonal'
  } else if (area === 'Grid') {
    return 'the grid'
  }

  if (typeof area !== 'object') {
    return ''
  }

  if ('Row' in area) {
    return `row ${area.Row + 1}`
  } else if ('Column' in area) {
    return `column ${area.Column + 1}`
  } else if ('Region' in area) {
    if (area.Region >= gridSize) {
      return `extra region ${area.Region - gridSize + 1}`
    } else {
      return `box ${area.Region + 1}`
    }
  } else if ('Thermo' in area) {
    return 'a thermometer'
  } else if ('KillerCage' in area) {
    return 'a killer cage'
  } else if ('KropkiDot' in area) {
    return 'a kropki dot pair'
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
  } else {
    throw new Error(`unknown area ${JSON.stringify(area)}`)
  }
}

const computeInvalidStateReason = (step: SolutionStep, gridSize: number) => {
  const reason = step.invalidStateReason!
  switch (reason.stateType) {
    case 'CellEmpty':
      return `${areaDisplay(reason.area, gridSize)} is empty`
    case 'CellInvalidValue':
      return `${areaDisplay(reason.area, gridSize)} has invalid digit ${reason.values[0]}`
    case 'CellNoCandidates':
      return `${areaDisplay(reason.area, gridSize)} has no candidates left`
    case 'AreaValueConflict':
      return `${areaDisplay(reason.area, gridSize)} has multiple ${reason.values[0]} digits`
    case 'AreaConstraint':
      return `${areaDisplay(reason.area, gridSize)} constraints are not satisfied`
    case 'AreaCandidates':
      return `digits ${[...reason.values].sort().join(', ')} can't be placed in ${areaDisplay(reason.area, gridSize)}`
  }
}

const getBigStepExplanation = (step: SolutionStep, hintLevel: HintLevel, gridSize: number): string => {
  const cellDisplays = step.cells.map(cell => cellDisplay(cell))
  const cells = cellDisplays.join(', ')
  const affectedCells = step.affectedCells.map(cell => cellDisplay(cell)).join(', ')
  const values = [...step.values].sort().join(', ')

  const applyGridStepHint = (text: string) => {
    if (hintLevel === HintLevel.Full) {
      text += ` (${values})`
    }
    return text
  }

  switch (step.rule) {
    case 'HiddenSingle': {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return applyGridStepHint(` in ${areaMessage} on cell ${cellDisplay(step.cells[0])}`)
    }
    case 'NakedSingle':
    case 'Thermo':
    case 'PalindromeValues':
      return applyGridStepHint(` on cell ${cellDisplay(step.cells[0])}`)
    case 'Candidates':
      return ' for all cells'
    case 'HiddenPairs':
    case 'HiddenTriples': {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return ` in ${areaMessage} on cells ${cells} to only keep ${values}`
    }
    case 'XWing': {
      const areaDisplays = step.areas.map(area => areaDisplay(area, gridSize))
      return ` on cells ${cells} (${areaDisplays[0]} and ${areaDisplays[1]}) ` +
        `to remove ${values} from ${affectedCells} (${areaDisplays[2]} and ${areaDisplays[3]})`
    }
    case 'XYWing':
      const zValue = step.values[2]
      return ` on cells ${cells} to remove ${zValue} from ${affectedCells}`
    case 'CommonPeerElimination': {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return ` to remove value ${values} from ${affectedCells} because it ` +
        `would eliminate it as candidate from ${areaMessage} (cells ${cells})`
    }
    // TODO: KropkiAdvancedCandidates + because it would eliminate all candidates from ${cells}
    case 'CommonPeerEliminationKropki': {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return ` to remove ${values} from ${affectedCells} because all chain combinations in ${areaMessage} would eliminate them`
    }
    // TODO: ArrowAdvancedCandidates + because it would eliminate all candidates from ${cells}
    case 'CommonPeerEliminationArrow': {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return ` to remove ${values} from ${affectedCells} because all arrow combinations in ${areaMessage} would eliminate them`
    }
    case 'TurbotFish':
      return ` on strong links ${cellDisplays[0]}-${cellDisplays[1]} and ` +
        `${cellDisplays[2]}-${cellDisplays[3]}. Because ${cellDisplays[0]} and ${cellDisplays[2]} ` +
        `see each other, at least one of ${cellDisplays[1]} and ${cellDisplays[3]} will be ${values}, so remove ` +
        `${values} from cells ${affectedCells}.`
    case 'TopBottomCandidates': {
      const ascending = (step.areas[0] as any).Row + 1 === step.values[0]
      const otherValue = (ascending === ((step.areas[0] as any).Row < (step.areas[1] as any).Row)) ? step.values[0] + 1 : step.values[0] - 1
      return ` in ${areaDisplay(step.areas[0], gridSize)} to remove ${values} from ${affectedCells} because ` +
        `${step.affectedCells.length !== 1 ? 'they' : 'it'} can't be linked with digit ${otherValue} ` +
        `on ${areaDisplay(step.areas[1], gridSize)}`
    }
    case 'EmptyRectangles':
      return ` in ${areaDisplay(step.areas[0], gridSize)} that sees strong link ` +
        `${cellDisplays[0]}-${cellDisplays[1]} to remove ${values} from ${affectedCells}`
    case 'NishioForcingChains':
      return ` Remove ${values} from cell ${affectedCells} because then ${computeInvalidStateReason(step, gridSize)}`;
    default:
      // Some techniques don't have areas (e.g. XY-Wing)
      const areaMessage = step.areas.length > 0 ? ` in ${areaDisplay(step.areas[0], gridSize)}` : ''

      // Some techniques don't have cells (e.g. killer cage, kropki chains)
      const cellsMessage = cells.length > 0 ? ` on ${pluralize(cells.length, 'cell')} ${cells}` : ''

      return `${areaMessage}${cellsMessage} to remove ${values} from ${affectedCells}`
  }
}

export const getStepDescription = (step: SolutionStep, hintLevel: HintLevel, gridSize: number) => {
  let hint = <b>
    <ExternalLink url={`/learn#${step.rule}`}>
      {StepRuleDisplay[step.rule]}
    </ExternalLink>
  </b>

  if (hintLevel !== HintLevel.Small) {
    return <>
      {hint} {getBigStepExplanation(step, hintLevel, gridSize)}
    </>
  }

  return hint
}

const cellsDoNotContainCandidates = (cells: CellPosition[], values: number[], cellMarks: CellMarks[][]) => (
  cells.every(({ row, col }) => {
    const marks = flatten(_values(cellMarks[row][col]))
    return marks.length > 0 && intersection(marks, values).length === 0
  })
)

const cellsOnlyContainCandidates = (cells: CellPosition[], values: number[], cellMarks: CellMarks[][]) => (
  cells.every(({ row, col }) => {
    const marks = flatten(_values(cellMarks[row][col]))
    return marks.length > 0 && difference(marks, values).length === 0
  })
)

const cellsDoNotContainSet = (cells: CellPosition[], values: number[], cellMarks: CellMarks[][]) => (
  cells.every(({ row, col }, index) => {
    const marks = flatten(_values(cellMarks[row][col]))
    return marks.length > 0 && !marks.includes(values[index])
  })
)

const isRedundantStep = (step: SolutionStep, cellMarks: CellMarks[][]) => {
  switch (step.rule) {
    case 'Candidates':
      return true
    case 'HiddenSingle':
    case 'NakedSingle':
    case 'Thermo':
    case 'PalindromeValues':
      return false
    case 'HiddenPairs':
    case 'HiddenTriples':
      return cellsOnlyContainCandidates(step.cells, step.values, cellMarks)
    case 'XYWing':
      const zValue = step.values[2]
      return cellsDoNotContainCandidates(step.affectedCells, [ zValue ], cellMarks)
    case 'CommonPeerEliminationKropki':
    case 'CommonPeerEliminationArrow':
      return cellsDoNotContainSet(step.affectedCells, step.values, cellMarks)
    default:
      return cellsDoNotContainCandidates(step.affectedCells, step.values, cellMarks)
  }
}

export const isGridStep = (step: SolutionStep) => GRID_STEPS.includes(step.rule)

const computeHintText = (steps: SolutionStep[], hintLevel: HintLevel, gridSize: number, isExternal: boolean) => {
  const singleIndex = steps.findIndex(isGridStep)

  if (singleIndex === -1) {
    let message
    if (isExternal) {
      message = <>
        No solution found. This is a user-generated puzzle, so either there is no
        unique solution or the solver isn't good enough. You can contact the admins on {' '}
        <ExternalLink url={DISCORD_INVITE_URL}>Discord</ExternalLink>
        .
      </>
    } else {
      // This shouldn't ever happen :D
      message = <>
        Well, this is embarrassing... 😅 Can't figure this out either...
        We received a notification and will fix it.
      </>
    }
    return [ message, true ]
  }

  if (singleIndex === 0) {
    const step = steps[0]
    return [ <>There is a <span>{getStepDescription(step, hintLevel, gridSize)}</span>.</>, false ]
  }

  let relevantSteps = steps.slice(0, singleIndex + 1)
  let candidateSteps = relevantSteps.slice(0, relevantSteps.length - 1)
  if (hintLevel === HintLevel.Small) {
    candidateSteps = uniqBy(candidateSteps, 'rule')
  }
  const lastStep = last(relevantSteps)!

  let message = <>
    <p>We need to work with cell candidates now. Use the following techniques to remove candidates:</p>

    <ul className="list-disc list-inside">
      {candidateSteps.map((step, index) => (
        <li key={index}>
          {getStepDescription(step, hintLevel, gridSize)}
        </li>
      ))}
    </ul>

    <p className="mt-2">Finally, there is a <span>{getStepDescription(lastStep, hintLevel, gridSize)}</span>.</p>
  </>

  return [ message, false ]
}

export const computeHintContent = (
  solution: SudokuLogicalSolveResult | null, hintLevel: HintLevel, cellMarks: CellMarks[][],
  gridSize: number, isExternal: boolean,
) => {
  if (!solution) {
    return [ '', false ]
  }
  if (solution.solutionType === 'None') {
    return [
      "You're on the wrong track 😳 You made a mistake somewhere along the way 😞",
      false,
      true,
    ]
  }

  const steps = solution.steps!.filter(step => !isRedundantStep(step, cellMarks));
  const filteredSteps = steps.length < solution.steps!.length - 1

  const [ message, error ] = computeHintText(steps, hintLevel, gridSize, isExternal)

  return [ message, filteredSteps, error ]
}
