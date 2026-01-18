import type { Rule, SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { useMemo } from 'react'
import { CellHighlight } from 'src/components/Puzzle/SudokuGridGraphics'
import { Theme, useTheme } from 'src/components/ThemeProvider'
import { getAreaCells } from './sudoku'

interface HighlighterContext {
  step: SolutionStep
  constraints: SudokuConstraints
  areaColor: string
  cellColor: string
}

type Highlighter = (context: HighlighterContext) => CellHighlight[]

const hiddenSingleHighlighter: Highlighter = ({ step: { areas, cells }, cellColor, areaColor, constraints }) => (
  [
    ...getAreaCells(areas[0], constraints).map((areaCell) => ({
      position: areaCell,
      color: areaColor,
    })),
    ...cells.slice(1).map(otherCell => ({
      position: otherCell,
      color: 'red',
    })),
    {
      position: cells[0],
      color: cellColor,
    }
  ]
)

const techniqueHighlighters: { [key in Rule]: Highlighter } = {
  NakedSingle: ({ step: { cells }, cellColor }) => (
    [{
      position: cells[0],
      color: cellColor,
    }]
  ),
  HiddenSingle: hiddenSingleHighlighter,
  Thermo: hiddenSingleHighlighter, // TODO: revisit
  PalindromeValues: hiddenSingleHighlighter, // TODO: improve
  Candidates: () => [],
  // TODO: create highlights for all techniques
  Kropki: () => [],
  ThermoCandidates: () => [],
  KillerCandidates: () => [],
  ArrowCandidates: () => [],
  RenbanCandidates: () => [],
  PalindromeCandidates: () => [],
  ArrowAdvancedCandidates: () => [],
  Killer45: () => [],
  KropkiChainCandidates: () => [],
  KropkiAdvancedCandidates: () => [],
  TopBottomCandidates: () => [],
  LockedCandidatesPairs: () => [],
  NakedPairs: () => [],
  HiddenPairs: () => [],
  CommonPeerElimination: () => [],
  CommonPeerEliminationKropki: () => [],
  CommonPeerEliminationArrow: () => [],
  LockedCandidatesTriples: () => [],
  NakedTriples: () => [],
  HiddenTriples: () => [],
  XWing: () => [],
  XYWing: () => [],
  Swordfish: () => [],
  TurbotFish: () => [],
  EmptyRectangles: () => [],
  AdhocNakedSet: () => [],
  PhistomefelRing: () => [],
  NishioForcingChains: () => [],
}

const getStepCellHighlights: Highlighter = (context: HighlighterContext): CellHighlight[] => {
  return techniqueHighlighters[context.step.rule](context)
}

export const useStepCellHighlights = (
  { step, constraints, disabled }: { step?: SolutionStep, constraints?: SudokuConstraints, disabled?: boolean }
): CellHighlight[] => {
  const { theme } = useTheme()

  return useMemo(() => {
    if (step === undefined || constraints === undefined || disabled) {
      return []
    }

    const areaColor = theme === Theme.Light ? 'grey' : 'lightgray'
    const cellColor = theme === Theme.Light ? 'grey' : 'lightgreen'

    const context: HighlighterContext = {
      step,
      constraints,
      areaColor,
      cellColor,
    }

    return getStepCellHighlights(context)
  }, [step, constraints, theme])
}
