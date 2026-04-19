import type { Area, CellPosition, Rule, SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { useMemo } from 'react'
import { getAreaCells } from './sudoku'
import { isEqual, uniqWith } from 'lodash-es'
import { CustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/CustomGraphics'
import {
  areaToCustomGraphicsItem, buildCornerMarkGraphicsItem, cellToArea, cellToCustomGraphicsItem,
} from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/utils'

interface HighlighterContext {
  step: SolutionStep
  constraints: SudokuConstraints
}

type Highlighter = (context: HighlighterContext) => CustomGraphicsItem[]

const getUniqueAreasCells = (areas: Area[], constraints: SudokuConstraints): CellPosition[] => (
  uniqWith(areas.flatMap((area) => getAreaCells(area, constraints)), isEqual)
)

const hiddenSingleHighlighter: Highlighter = ({ step: { areas, cells } }) => (
  [
    areaToCustomGraphicsItem(areas[0]),
    ...cells.slice(1).map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    cellToCustomGraphicsItem(cells[0]),
  ]
)

const techniqueHighlighters: Record<Rule, Highlighter> = {
  // no candidates, single: 2100300000000000
  // with candidates, also pairs: N4IgpgbmB2DCYBsEGcQC4DaoDGB7B6AjADQgBOuA7ugAwC%2BxO%2B6AzKRdWvYyHgWiXJV0AJgZN%2BbIZzEBdUgDMAlgA8wAEwByAVwC2AIzBlUmUAAdcyJQBcluaOgnoArO2FpnDEBACGCbWCi4iAWVrb2jrzMaCJunNzefgEuwaE2dg5oTlxxKaS%2B%2FoFoACyplukRWVH8NLloLF4FyTFlYRmRfC51DflJRaU8aeGZ2bXStI19RK0VI9Vd41yThawzwx3RrouEy8078iAA5mRK6gDKSgBeRQBspLjq6vBIJljzJd3BnTF1njzfxV%2BX2isUWDVkdCAA%3D
  NakedSingle: ({ step: { cells, areas }, constraints }) => [
    cellToCustomGraphicsItem(cells[0]),
    // With candidates we get 0 areas, without candidates we get all necessary areas
    // ...(areas.length > 0 ? areas.map(area => areaToCustomGraphicsItem(area)) : []),
    ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
  ],
  // 0100000000100000
  HiddenSingle: hiddenSingleHighlighter,
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgdw4BfbgDcAhiyQx8AZkEBdbgHNMEOAGUIAL2l4ALN0oALLCnL4CREMzZ4uPfkM5NW%2BAIzdeAuwvmCgA%3D
  Thermo: hiddenSingleHighlighter,
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wEYAaETUgd3wAGAL7cAbgEMWSGB2EBdbgHNMEOAGUIAL1l4ALN2JSItOLxQxchIiGZs8XHvyGimrfACZuvAQ4XzhIA%3D%3D%3D
  PalindromeValues: hiddenSingleHighlighter,
  Candidates: () => [],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgdw4BfbgDcAhiyQx8ARkEBdbgHNMEOAGUIAL2l4ALNwDWvYoYgARUpVyEmMFixkMQzNngBM3XgI%2FCX9lndnV3xPHn58AGY%2FOCsAFQBPYl0QAGE6bBhGJGoRaQUjEzMEGCUxXN1KTClBIA
  Kropki: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wBGAL7cAbgEMWSGPgBMwgLrcA5pghwAyhABesvABZulABZYU5fASIhmbPFx78hopqyHdeAh0sXCgA%3D
  ThermoCandidates: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4Ig5gTglgJgylAXgUxALgCwBoQGsoA2ByEAwgIZjIDO6A2qBMmFAPYB29oAxqwegAYcEVgHdBAXyw8%2B6AIzCxk6SF780AJkXi0AiQF0c1AK4BbdADYDEoA%3D
  KillerCandidates: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4IghgThD2DuDOIBcBtUkawMIFMA2eiqoAxtHsgEwA0ImyAjAL7WnmO31IAMTAurRIBLCCTw5cBImhBkKSBpzhV%2B%2FWgHMIQgCYBlIQC8cyACxMgA
  ArrowCandidates: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgdw4BfbgDcAhiyQx8ARkEBdbgHNMEOAGUIAL2l4ALN0wxaaMbVyEiIZmzxce%2FIZyatZhx3YXzBQA%3D
  RenbanCandidates: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wEYAaETUgd3wAmAL7cAbgEMWSGB2EBdbgHNMEOAGUIAL1l4ALN2JSItOLxQxchIiGZs8XHv3wAGUU1ZDuvAQ4XzhIA%3D%3D%3D
  PalindromeCandidates: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4IghgThD2DuDOIBcBtUkawMIFMA2eiqoAxtHsgBwA0ImVAvtaecgOy31KVMsVIA2TnEYBdWiQCWEEnhy4CRNCDL8OdEUjYNRO2gDNJADxwATAHIBXALYAjHBCWgADtHiSALpOgA7ZH2QABmFYIKYQADcwPEscZABGXhBXdy9ffxVWJGCNUKRE2iiYuKQAFiSUz28%2FJADskOQAJnCi2OQAVgq3KvTazP4crgBmFui2wS7U6ozVIIay0eL2SZ6ausHNTsKxkp5mZO60tf653OQBRfGAThWjmaz1LgvtpaQtl0PpvtnueefInbnPQgADmEEkpgAypIAF4lG5AA
  ArrowAdvancedCandidates: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4Ig5gTglgJgylAXgUxALgGwBoQGsoA2ByEAwgIZjIDO6A2qBMmFAPYB29oAxqwegAYcEVgHdBAXyw8%2B6AIzCxk6SF780QkCPFo5EgLo5qAVwC28gExTGzNpzQNVs3Yp16Va9BdfyDRs%2BgArAYSQA%3D%3D%3D
  Killer45: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4Ig5gTglgJgylAXgUxALgCwBoQGsID2ADrlACIEAuAzugNqgDGyANiwIzpMEvoAMOQgHd%2BAXxzM2AJi4hGPdO0EERaPuJAwqAFQCeRVGhAUArgCMWqcU1YdZ83miUhhYibZlpujqctXqcLUo9A3RjAnNLEFEAXVEgA%3D
  KropkiChainCandidates: ({ step: { areas, affectedCells }, constraints }) => [
    // TODO: somehow highlight the container region areas[0]?
    ...getUniqueAreasCells(areas.slice(1), constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wFYAaETUgd3wBGAL7cAbgEMWSGPgDMokuSo16eJq3wA2brwF4R4qTPwAWRSDIVqdBiGZs8Adl38hokJOmy87C1ZVbdXtNPAAOV31DT2MfLX9lGzUNRwAGSI4PLxM8AE4E61U7B3x0njc8eKNvfDCCwOSQtIznLNj8J3qk4tCucv066pzDJUKglO0WwZia3y6i4JLnKbbZ%2BIBdbgBzTAg4AGUIAC8fXO4Aa15ic4gAEVJKXEImGBYWQR7m%2FvduRleWABMn1KLQBHjgDwAKgBPYg%2BEAAYTo2BgjCQ1DEsgsfzeH0WoTKenwYN%2B%2FyB%2BK%2BRLwCm4EMoMLh%2BERyNR6IgmJAwnWwiAA
  // TODO: show which cell will become invalid
  KropkiAdvancedCandidates: ({ step: { areas, affectedCells }, constraints }) => [
    ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wAWAL7cAbgEMWSGPgCMwgLrcA5pghwAyhABesvADZulUsQBCpSiZT5KmGcKA%3D%3D
  // TODO: can be improved to show the other row's digits
  TopBottomCandidates: ({ step: { areas, affectedCells }, constraints }) => [
    ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
  // 400000123000000000000000000000000000
  LockedCandidatesPairs: ({ step: { areas, cells, affectedCells, values }, constraints }) => [
    ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
  ],
  // N4IghgdgLglg0hGBzAFlEAuKAnArgUwBoQAzGAD3wBMA5XAWwCN9sBnTAbVAAcB7VmLF4RMoAMa8ANpgAMxbLwDusgL7EAbmEkFMAVjU9%2BgmMNEgJ0jAEZ5S1Rq06MANgMg%2BAoSIzipmAEy2yhgyaiCa2viYAOxuHsamPuZ%2BIUGYVmERTgAccUZeZhayaRj%2BmY5RGACceZ4m3r6WAMwlTeWRmG2EhnWJjcUgCsEALO1Oo93u%2BfWFKcMloQ4dGKMAusRI2DBUAMowAF6VNUA%3D
  NakedPairs: ({ step: { areas, cells, affectedCells, values } }) => [
    areaToCustomGraphicsItem(areas[0]),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
  ],
  // 000120000000001000002000000000000000
  HiddenPairs: ({ step: { areas, cells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell)),
  ],
  // N4IghgdgLglg0jCBzEAuKAnArgUwDQgBmMAHjgCYByWAtgEY4YDOaA2qAA4D2TMsXENKADGXADZoAjAQxcA7mgAMAXwIA3MGNxTVnHnxgChIURNQAmGfKWqQGrTjTndIbr36DUI8U6sLUkrb22qgAzMoAugRIGDDkAMowAF6OqABsykA
  CommonPeerElimination: ({ step: { areas, cells, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
  ],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wCYAaETUgd3wAWAL7cAbgEMWSGPgDsokuSo16eJqw7deAvAFZRISdNn7FIMhWp0GIZmzyDt%2FfAfFSZHc5ZU31dzX1nXTcjD1MAZm9lazUNBwA2YKFDY088dmEAXW4Ac0wIOABlCAAvUwBObgBrXmJqiAARUkpcQiYYFhYARlt7fAAGZLwo7kZOlnY%2BwO7h0ZA4FoAVAE9iUxAAYTpsGEYkajFZc3Gu3v9%2BvCGeFxHDU8nph2udFO5FylX1%2FC2dvYOIEcQNlhEA%3D%3D%3D
  CommonPeerEliminationKropki: ({ step: { areas, affectedCells }, constraints }) => [
    ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
    ...uniqWith(affectedCells, isEqual).map((cell) => cellToCustomGraphicsItem(cell)),
  ],
  // N4IghgThD2DuDOIBcBtUkawMIFMA2eiqoAxtHsgBwA0ImyATAL7WnnIDst9SzrIZCkgBs3OIyYBdWiQCWEEnhy4CRNAPZIudcUgCMUqbQBmsgB44AJgDkArgFsARjghrQAB2jxZAF1nQAO2Q2IQBWMVhkAAYWEAA3MDxbHGQDfk9vP0DgjTCI1NiEpJSkAE4WDy9ffyCkENT8pFDCxOSC9Kqs2vqkKMbhFuKC6RAAcwhZSwBlWQAvEvKgA%3D%3D
  CommonPeerEliminationArrow: ({ step: { areas, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    ...uniqWith(affectedCells, isEqual).map((cell) => cellToCustomGraphicsItem(cell)),
  ],
  // 123000000000000000000000000000000000
  LockedCandidatesTriples: ({ step: { areas, cells, affectedCells }, constraints }) => [
    ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map((cell) => cellToCustomGraphicsItem(cell)),
  ],
  // 000000000000569000009870000003000000004100000005400000006000000007020000008040000
  NakedTriples: ({ step: { areas, cells, affectedCells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
  ],
  // 000100000000000000000000000010000000020000000030000000001000000002000000003000000
  HiddenTriples: ({ step: { areas, cells } }) => [
    areaToCustomGraphicsItem(areas[0]),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell)),
  ],
  // 000000000304567890000020000000000000000000000000002000405678910000000000000000000
  XWing: ({ step: { areas, cells, affectedCells, values } }) => [
    ...areas.map(area => areaToCustomGraphicsItem(area)),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
  ],
  // 401000968070198432800600517002010694140026873000000125004200351050001006010003009
  XYWing: ({ step: { cells, affectedCells, values } }) => [
    cellToCustomGraphicsItem(cells[0], 'yellow'),
    ...cells.slice(1).map(cell => cellToCustomGraphicsItem(cell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ...cells.slice(1).map(cell => buildCornerMarkGraphicsItem(cell, [values[2]], 'red')),
  ],
  // TODO: implement after adding technique
  Swordfish: () => [],
  // 120734056345000000076000000200000000400000000500000000000000009600000000000008000
  TurbotFish: ({ step: { areas, cells, affectedCells, values } }) => [
    ...areas.map(area => areaToCustomGraphicsItem(area)),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
  ],
  // 000000008020000700000100000001000300000000400000000500000000000000000800000000900
  EmptyRectangles: ({ step: { areas, cells, affectedCells, values } }) => [
    ...areas.slice(1).map(area => areaToCustomGraphicsItem(area)),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
  ],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wBGAL7cAbgEMWSGPgDMokuSo16eJq3wAWbrwF4R4qTPwAmRSDIVqdBiGZs8AVl38hokJOmyDwgLrcAOaYEHAAyhAAXj4AbNyUABZYKOT4BET2mnhyrvrmnBqOprnuBZmOOTxueOz%2BfsJAA
  AdhocNakedSet: ({ step: { areas, cells, affectedCells, values } }) => [
    ...areas.map(area => areaToCustomGraphicsItem(area)),
    ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
  ],
  // TODO: implement after adding technique
  PhistomefelRing: () => [],
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wBGAL7cAbgEMWSGPgDMokuSo16eJq3wAWbrwF4R4qTPwAmRSDIVqdBiGZs8AVl38hokJOmyDwgLrcAOaYEHAAyhAAXj4AbNyUABZYKOT4BET2mnhyrvrmnBqOprnuBZmOOTxueOz%2BfsJAA
  // TODO: can be improved
  NishioForcingChains: ({ step: { invalidStateReason, affectedCells } }) => [
    ...(invalidStateReason ? [areaToCustomGraphicsItem(invalidStateReason.area, 'red')] : []),
    cellToCustomGraphicsItem(affectedCells[0]),
  ],
}

const getStepCustomGraphics: Highlighter = (context: HighlighterContext): CustomGraphicsItem[] => {
  return techniqueHighlighters[context.step.rule]?.(context) ?? []
}

export const useStepCustomGraphics = (
  { step, constraints, disabled }: { step?: SolutionStep, constraints?: SudokuConstraints, disabled?: boolean }
): CustomGraphicsItem[] =>
  useMemo(() => {
    if (step === undefined || constraints === undefined || disabled) {
      return []
    }

    const context: HighlighterContext = {
      step,
      constraints,
    }

    return getStepCustomGraphics(context)
  }, [step, constraints])
