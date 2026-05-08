import { difference, flatten, intersection, last, uniqBy, values as _values, uniqWith, isEqual } from 'lodash-es'
import ExternalLink from 'src/components/ExternalLink'
import { HintLevel } from 'src/reducers/puzzle'
import { CellMarks, Grid } from 'src/types/sudoku'
import { GRID_STEPS } from './constants'
import { gridToFixedNumbers } from './sudoku'
import { DISCORD_INVITE_URL } from 'src/components/AppFooter/DiscordIcon'
import type { CellPosition, SolutionStep, SudokuConstraints, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { StepDescription } from 'src/components/solver/StepDescription'

// Integrates grid contents into constraints' fixed_numbers
export const combineConstraintsWithGrid = (constraints: SudokuConstraints, grid: Grid) => {
  const gridFixedNumbers = gridToFixedNumbers(grid)
  return {
    ...constraints,
    fixedNumbers: uniqWith([
      ...constraints.fixedNumbers ?? [],
      ...gridFixedNumbers,
    ], (a, b) => isEqual(a.position, b.position))
  }
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

const computeHintText = (steps: SolutionStep[], hintLevel: HintLevel, constraints: SudokuConstraints, isExternal: boolean) => {
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
    return [ message, true ] as const
  }

  if (singleIndex === 0) {
    const step = steps[0]
    return [
      <>
        There is a{' '}
        <StepDescription step={step} hintLevel={hintLevel} constraints={constraints} />
        .
      </>,
      false
    ] as const
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
          <StepDescription step={step} hintLevel={hintLevel} constraints={constraints} />
        </li>
      ))}
    </ul>

    <p className="mt-2">
      Finally, there is a{' '}
      <StepDescription step={lastStep} hintLevel={hintLevel} constraints={constraints} />
      .</p>
  </>

  return [ message, false ] as const
}

export const computeHintContent = (
  solution: SudokuLogicalSolveResult | null, hintLevel: HintLevel, cellMarks: CellMarks[][],
  constraints: SudokuConstraints, isExternal: boolean,
) => {
  if (!solution) {
    return [ '', false, false ] as const
  }
  if (solution.solutionType === 'None') {
    return [
      "You're on the wrong track 😳 You made a mistake somewhere along the way 😞",
      false,
      true,
    ] as const
  }

  const steps = solution.steps!.filter(step => !isRedundantStep(step, cellMarks));
  const filteredSteps = steps.length < solution.steps!.length - 1

  const [ message, error ] = computeHintText(steps, hintLevel, constraints, isExternal)

  return [ message, filteredSteps, error ] as const
}
