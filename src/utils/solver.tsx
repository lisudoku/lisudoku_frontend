import _ from 'lodash'
import ExternalLink from 'src/components/ExternalLink'
import { HintLevel } from 'src/reducers/puzzle'
import { CellNotes, CellPosition, FixedNumber, Grid, SudokuConstraints } from 'src/types/sudoku'
import { SolutionStep, SolutionType, StepRule, SudokuLogicalSolveResult } from 'src/types/wasm'
import { StepRuleDisplay } from './constants'
import { pluralize } from './misc'
import { computeFixedNumbersGrid, getAllCells } from './sudoku'
import { honeybadger } from 'src/components/HoneybadgerProvider'
import { DISCORD_INVITE_URL } from 'src/components/AppFooter'

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

const areaDisplay = (area: any, gridSize: number) => {
  if (area.Row !== undefined) {
    return `row ${area.Row + 1}`
  } else if (area.Column !== undefined) {
    return `column ${area.Column + 1}`
  } else if (area.Region !== undefined) {
    if (area.Region >= gridSize) {
      return `extra region ${area.Region - gridSize + 1}`
    } else {
      return `box ${area.Region + 1}`
    }
  } else if (area.Thermo !== undefined) {
    return 'a thermometer'
  } else if (area.KillerCage !== undefined) {
    return 'a killer cage'
  } else if (area.KropkiDot !== undefined) {
    return 'a kropki dot pair'
  } else if (area === 'PrimaryDiagonal') {
    return 'the negative diagonal'
  } else if (area === 'SecondaryDiagonal') {
    return 'the positive diagonal'
  } else if (area.Arrow !== undefined) {
    return 'an arrow'
  } else {
    throw new Error(`unknown area ${JSON.stringify(area)}`)
  }
}

const getBigStepExplanation = (step: SolutionStep, hintLevel: HintLevel, gridSize: number) => {
  const cellDisplays = step.cells.map(cell => cellDisplay(cell))
  const cells = cellDisplays.join(', ')
  const affectedCells = step.affected_cells.map(cell => cellDisplay(cell)).join(', ')
  const values = [...step.values].sort().join(', ')

  const applyGridStepHint = (text: string) => {
    if (hintLevel === HintLevel.Full) {
      text += ` (${values})`
    }
    return text
  }

  switch (step.rule) {
    case StepRule.HiddenSingle: {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return applyGridStepHint(` in ${areaMessage} on cell ${cellDisplay(step.cells[0])}`)
    }
    case StepRule.NakedSingle:
    case StepRule.Thermo:
      return applyGridStepHint(` on cell ${cellDisplay(step.cells[0])}`)
    case StepRule.Candidates:
      return ' for all cells'
    case StepRule.HiddenPairs:
    case StepRule.HiddenTriples: {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return ` in ${areaMessage} on cells ${cells} to only keep ${values}`
    }
    case StepRule.XWing: {
      const areaDisplays = step.areas.map(area => areaDisplay(area, gridSize))
      return ` on cells ${cells} (${areaDisplays[0]} and ${areaDisplays[1]}) ` +
        `to remove ${values} from ${affectedCells} (${areaDisplays[2]} and ${areaDisplays[3]})`
    }
    case StepRule.XYWing:
      const zValue = step.values[2]
      return ` on cells ${cells} to remove ${zValue} from ${affectedCells}`
    case StepRule.CommonPeerElimination: {
      const areaMessage = areaDisplay(step.areas[0], gridSize)
      return ` to remove value ${values} from ${affectedCells} because it ` +
        `would eliminate it as candidate from ${areaMessage} (cells ${cells})`
    }
    // TODO: KropkiAdvancedCandidates + because it would eliminate all candidates from ${cells}
    case StepRule.CommonPeerEliminationKropki:
      return ` to remove ${values} from ${affectedCells} because all chain combinations in ${step.areas[0]} would eliminate them`
    // TODO: ArrowAdvancedCandidates + because it would eliminate all candidates from ${cells}
    case StepRule.CommonPeerEliminationArrow:
      return ` to remove ${values} from ${affectedCells} because all arrow combinations in ${step.areas[0]} would eliminate them`
    case StepRule.TurbotFish:
      return ` on strong links ${cellDisplays[0]}-${cellDisplays[1]} and ` +
        `${cellDisplays[2]}-${cellDisplays[3]}. Because ${cellDisplays[0]} and ${cellDisplays[2]} ` +
        `see each other, at least one of ${cellDisplays[1]} and ${cellDisplays[3]} will be ${values}, so remove ` +
        `${values} from cells ${affectedCells}.`
    case StepRule.TopBottomCandidates: {
      const ascending = step.areas[0].Row + 1 === step.values[0]
      const otherValue = (ascending === (step.areas[0].Row < step.areas[1].Row)) ? step.values[0] + 1 : step.values[0] - 1
      return ` in ${areaDisplay(step.areas[0], gridSize)} to remove ${values} from ${affectedCells} because ` +
        `${step.affected_cells.length !== 1 ? 'they' : 'it'} can't be linked with digit ${otherValue} ` +
        `on ${areaDisplay(step.areas[1], gridSize)}`
    }
    case StepRule.EmptyRectangles:
      return ` in ${areaDisplay(step.areas[0], gridSize)} that sees strong link ` +
        `${cellDisplays[0]}-${cellDisplays[1]} to remove ${values} from ${affectedCells}`
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

const cellsDoNotContainCandidates = (cells: CellPosition[], values: number[], notes: CellNotes[][]) => (
  cells.every(
    ({ row, col }) => notes[row][col].length > 0 && _.intersection(notes[row][col], values).length === 0
  )
)

const cellsOnlyContainCandidates = (cells: CellPosition[], values: number[], notes: CellNotes[][]) => (
  cells.every(
    ({ row, col }) => notes[row][col].length > 0 && _.difference(notes[row][col], values).length === 0
  )
)

const cellsDoNotContainSet = (cells: CellPosition[], values: number[], notes: CellNotes[][]) => (
  cells.every(
    ({ row, col }, index) => notes[row][col].length > 0 && !notes[row][col].includes(values[index])
  )
)

const isRedundantStep = (step: SolutionStep, notes: CellNotes[][]) => {
  switch (step.rule) {
    case StepRule.Candidates:
      return true
    case StepRule.HiddenSingle:
    case StepRule.NakedSingle:
    case StepRule.Thermo:
      return false
    case StepRule.HiddenPairs:
    case StepRule.HiddenTriples:
      return cellsOnlyContainCandidates(step.cells, step.values, notes)
    case StepRule.XYWing:
      const zValue = step.values[2]
      return cellsDoNotContainCandidates(step.affected_cells, [ zValue ], notes)
    case StepRule.CommonPeerEliminationKropki:
    case StepRule.CommonPeerEliminationArrow:
      return cellsDoNotContainSet(step.affected_cells, step.values, notes)
    default:
      return cellsDoNotContainCandidates(step.affected_cells, step.values, notes)
  }
}

const computeHintText = (steps: SolutionStep[], hintLevel: HintLevel, isExternal: boolean, gridSize: number) => {
  const singleIndex = steps.findIndex(step => (
    [StepRule.HiddenSingle, StepRule.NakedSingle, StepRule.Thermo].includes(step.rule))
  )

  if (singleIndex === -1) {
    honeybadger.notify({
      name: 'No hint',
      message: `external = ${isExternal}`,
    })
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
        You should contact the admins on {' '}
        <ExternalLink url={DISCORD_INVITE_URL}>Discord</ExternalLink>
        !
      </>
    }
    return [ message, true ]
  }

  if (singleIndex === 0) {
    const step = steps[0]
    return [ <>There is a {getStepDescription(step, hintLevel, gridSize)}.</>, false ]
  }

  let relevantSteps = steps.slice(0, singleIndex + 1)
  let candidateSteps = relevantSteps.slice(0, relevantSteps.length - 1)
  if (hintLevel === HintLevel.Small) {
    candidateSteps = _.uniqBy(candidateSteps, 'rule')
  }
  const lastStep = _.last(relevantSteps)!

  let message = <>
    <p>We need to work with cell candidates now. Use the following techniques to remove candidates:</p>

    <ul className="list-disc list-inside">
      {candidateSteps.map((step, index) => (
        <li key={index}>
          {getStepDescription(step, hintLevel, gridSize)}
        </li>
      ))}
    </ul>

    <p className="mt-2">Finally, there is a {getStepDescription(lastStep, hintLevel, gridSize)}.</p>
  </>

  return [ message, false ]
}

export const computeHintContent = (
  solution: SudokuLogicalSolveResult | null, hintLevel: HintLevel, notes: CellNotes[][],
  isExternal: boolean, gridSize: number,
) => {
  if (!solution) {
    return [ '', false ]
  }
  if (solution.solution_type === SolutionType.None) {
    return [
      "You're on the wrong track 😳 You made a mistake somewhere along the way 😞",
      false,
      true,
    ]
  }

  const steps = solution.steps!.filter(step => !isRedundantStep(step, notes));
  const filteredSteps = steps.length < solution.steps!.length - 1

  const [ message, error ] = computeHintText(steps, hintLevel, isExternal, gridSize)

  return [ message, filteredSteps, error ]
}
