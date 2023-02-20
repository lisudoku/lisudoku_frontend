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
      ...constraints.fixedNumbers,
      ...extraFixedNumbers,
    ]
  }
}

const cellDisplay = (cell: CellPosition) => (
  `R${cell.row + 1}C${cell.col + 1}`
)

const getBigStepExplanation = (step: SolutionStep, hintLevel: HintLevel) => {
  const cellDisplays = step.cells.map(cell => cellDisplay(cell))
  const cells = cellDisplays.join(',')
  const affectedCells = step.affected_cells.map(cell => cellDisplay(cell)).join(',')
  const values = [...step.values].sort().join(',')

  switch (step.rule) {
    case StepRule.HiddenSingle:
    case StepRule.NakedSingle:
    case StepRule.Thermo:
      const cell = step.cells[0]
      let text = ` on cell ${cellDisplay(cell)}`
      if (hintLevel === HintLevel.Full) {
        text += ` (${values})`
      }
      return text
    case StepRule.Candidates:
      return ' for all cells'
    case StepRule.HiddenPairs:
    case StepRule.HiddenTriples:
      return ` on cells ${cells} to only keep ${values}`
    case StepRule.XYWing:
      const zValue = step.values[2]
      return ` on cells ${cells} to remove ${zValue} from ${affectedCells}`
    case StepRule.CommonPeerElimination:
      return ` to remove value ${values} from ${affectedCells} because it ` +
        `would eliminate it as candidate from cells ${cells}`
    case StepRule.CommonPeerEliminationKropki:
      return ` to remove kropki chain combination ${values} from ${affectedCells} because it ` +
        `would eliminate all candidates from ${cells}`
    case StepRule.TurbotFish:
      return ` on strong links ${cellDisplays[0]}-${cellDisplays[1]} and ` +
        `${cellDisplays[2]}-${cellDisplays[3]}. Because ${cellDisplays[0]} and ${cellDisplays[2]} ` +
        `see each other, at least one of ${cellDisplays[1]} and ${cellDisplays[3]} will be ${values}, so remove ` +
        `${values} from cells ${affectedCells}.`
    default:
      const cellsMessage = cells.length > 0 ? ` on ${pluralize(cells.length, 'cell')} ${cells}` : ''
      return `${cellsMessage} to remove ${values} from ${affectedCells}`
  }
}

export const getStepDescription = (step: SolutionStep, hintLevel: HintLevel) => {
  let hint = <b>
    <ExternalLink url={`/learn#${step.rule}`}>
      {StepRuleDisplay[step.rule]}
    </ExternalLink>
  </b>

  if (hintLevel !== HintLevel.Small) {
    return <>
      {hint} {getBigStepExplanation(step, hintLevel)}
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
      return cellsDoNotContainSet(step.affected_cells, step.values, notes)
    default:
      return cellsDoNotContainCandidates(step.affected_cells, step.values, notes)
  }
}

const computeHintText = (steps: SolutionStep[], hintLevel: HintLevel) => {
  if (steps.length === 0) {
    // This shouldn't ever happen :D
    honeybadger.notify({ name: 'No hint' })
    return <>
      Well, this is embarrassing... 😅 Can't figure this out either...
      You should contact the admins on {' '}
      <ExternalLink url={DISCORD_INVITE_URL}>Discord</ExternalLink>
      !
    </>
  }

  const singleIndex = steps.findIndex(step => (
    [StepRule.HiddenSingle, StepRule.NakedSingle, StepRule.Thermo].includes(step.rule))
  )

  if (singleIndex === 0) {
    const step = steps[0]
    return <>There is a {getStepDescription(step, hintLevel)}.</>
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
          {getStepDescription(step, hintLevel)}
        </li>
      ))}
    </ul>

    <p className="mt-2">Finally, you have a {getStepDescription(lastStep, hintLevel)}.</p>
  </>

  return message
}

export const computeHintContent = (
  solution: SudokuLogicalSolveResult | null, hintLevel: HintLevel, notes: CellNotes[][]
) => {
  if (!solution) {
    return [ '', false ]
  }
  if (solution.solution_type === SolutionType.None) {
    return [
      "You're on the wrong track 😳 You made a mistake somewhere along the way 😞",
      false,
    ]
  }

  const steps = solution.steps!.filter(step => !isRedundantStep(step, notes));
  const filteredSteps = steps.length < solution.steps!.length - 1

  const message = computeHintText(steps, hintLevel)

  return [ message, filteredSteps ]
}
