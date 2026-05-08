import type { Area, CellPosition, Rule, SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { isEqual, uniqWith } from 'lodash-es'
import { CustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/CustomGraphics'
import { HintLevel } from 'src/reducers/puzzle'
import { getAreaCells } from '../sudoku'
import { areaToCustomGraphicsItem, buildCornerMarkGraphicsItem, cellToCustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/utils'
import { areaDisplay, cellDisplay, computeInvalidStateReason } from './helpers'
import { pluralize } from '../misc'

interface StepLogicBaseContext {
  step: SolutionStep
  constraints: SudokuConstraints
  cellDisplays: string[]
  cellsDisplay: string
  affectedCellsDisplay: string
  valuesDisplay: string
}

interface StepLogicHighlightsContext extends StepLogicBaseContext {}

interface StepLogicDescriptionContext extends StepLogicBaseContext {
  hintLevel: HintLevel
}

type StepExplainer = (ctx: StepLogicDescriptionContext) => string
type StepHighlighter = (context: StepLogicHighlightsContext) => CustomGraphicsItem[]

interface StepLogic {
  description: StepExplainer
  highlights: StepHighlighter
}

const getUniqueAreasCells = (areas: Area[], constraints: SudokuConstraints): CellPosition[] => (
  uniqWith(areas.flatMap((area) => getAreaCells(area, constraints)), isEqual)
)

const hiddenSingleHighlighter: StepHighlighter = ({ step: { areas, cells } }) => (
  [
    areaToCustomGraphicsItem(areas[0]),
    ...cells.slice(1).map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
    cellToCustomGraphicsItem(cells[0]),
  ]
)

const defaultHighlighter: StepHighlighter = ({ step: { areas, affectedCells } }) => [
  areaToCustomGraphicsItem(areas[0]),
  cellToCustomGraphicsItem(affectedCells[0]),
]

const gridStepExplainer: StepExplainer = ({ step: { cells }, hintLevel, valuesDisplay }) => (
  ` on cell ${cellDisplay(cells[0])}${hintLevel === HintLevel.Full ? ` (${valuesDisplay})` : ''}`
)

const hiddenSetsExplainer: StepExplainer = ({ step: { areas }, constraints, valuesDisplay, cellsDisplay }) => (
  ` in ${areaDisplay(areas[0], constraints)} on cells ${cellsDisplay} to only keep ${valuesDisplay}`
)

const defaultExplainer: StepExplainer = ({ step: { areas, cells }, constraints, cellsDisplay, valuesDisplay, affectedCellsDisplay }) => {
  // Some techniques don't have areas
  const areaMessage = areas.length > 0 ? ` in ${areaDisplay(areas[0], constraints)}` : ''

  // Some techniques don't have cells (e.g. killer cage, kropki chains)
  const cellsMessage = cells.length > 0 ? ` on ${pluralize(cells.length, 'cell')} ${cellsDisplay}` : ''

  return `${areaMessage}${cellsMessage} to remove ${valuesDisplay} from ${affectedCellsDisplay}`
}

const stepsLogic: Record<Rule, StepLogic> = {
  // 0100000000100000
  HiddenSingle: {
    description: ({ step: { areas, cells }, constraints, hintLevel, valuesDisplay }) => (
    ` in ${areaDisplay(areas[0], constraints)} on cell ${cellDisplay(cells[0])}${hintLevel === HintLevel.Full ? ` (${valuesDisplay})` : ''}`
    ),
    highlights: hiddenSingleHighlighter,
  },
  // no candidates, single: 2100300000000000
  // with candidates, also pairs: N4IgpgbmB2DCYBsEGcQC4DaoDGB7B6AjADQgBOuA7ugAwC%2BxO%2B6AzKRdWvYyHgWiXJV0AJgZN%2BbIZzEBdUgDMAlgA8wAEwByAVwC2AIzBlUmUAAdcyJQBcluaOgnoArO2FpnDEBACGCbWCi4iAWVrb2jrzMaCJunNzefgEuwaE2dg5oTlxxKaS%2B%2FoFoACyplukRWVH8NLloLF4FyTFlYRmRfC51DflJRaU8aeGZ2bXStI19RK0VI9Vd41yThawzwx3RrouEy8078iAA5mRK6gDKSgBeRQBspLjq6vBIJljzJd3BnTF1njzfxV%2BX2isUWDVkdCAA%3D
  NakedSingle: {
    description: gridStepExplainer,
    highlights: ({ step: { cells, areas }, constraints }) => [
      cellToCustomGraphicsItem(cells[0]),
      // With candidates we get 0 areas, without candidates we get all necessary areas
      // ...(areas.length > 0 ? areas.map(area => areaToCustomGraphicsItem(area)) : []),
      ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
    ],
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgdw4BfbgDcAhiyQx8AZkEBdbgHNMEOAGUIAL2l4ALN0oALLCnL4CREMzZ4uPfkM5NW%2BAIzdeAuwvmCgA%3D
  Thermo: {
    description: gridStepExplainer,
    highlights: hiddenSingleHighlighter,
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wEYAaETUgd3wAGAL7cAbgEMWSGB2EBdbgHNMEOAGUIAL1l4ALN2JSItOLxQxchIiGZs8XHvyGimrfACZuvAQ4XzhIA%3D%3D%3D
  PalindromeValues: {
    description: gridStepExplainer,
    highlights: hiddenSingleHighlighter,
  },
  Candidates: {
    description: () => ' for all cells',
    highlights: () => [],
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgdw4BfbgDcAhiyQx8ARkEBdbgHNMEOAGUIAL2l4ALNwDWvYoYgARUpVyEmMFixkMQzNngBM3XgI%2FCX9lndnV3xPHn58AGY%2FOCsAFQBPYl0QAGE6bBhGJGoRaQUjEzMEGCUxXN1KTClBIA
  Kropki: {
    description: defaultExplainer,
    highlights: defaultHighlighter,
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wBGAL7cAbgEMWSGPgBMwgLrcA5pghwAyhABesvABZulABZYU5fASIhmbPFx78hopqyHdeAh0sXCgA%3D
  ThermoCandidates: {
    description: defaultExplainer,
    highlights: defaultHighlighter,
  },
  // N4Ig5gTglgJgylAXgUxALgCwBoQGsoA2ByEAwgIZjIDO6A2qBMmFAPYB29oAxqwegAYcEVgHdBAXyw8%2B6AIzCxk6SF780AJkXi0AiQF0c1AK4BbdADYDEoA%3D
  KillerCandidates: {
    description: defaultExplainer,
    highlights: defaultHighlighter,
  },
  // N4IghgThD2DuDOIBcBtUkawMIFMA2eiqoAxtHsgEwA0ImyAjAL7WnmO31IAMTAurRIBLCCTw5cBImhBkKSBpzhV%2B%2FWgHMIQgCYBlIQC8cyACxMgA
  ArrowCandidates: {
    description: defaultExplainer,
    highlights: defaultHighlighter,
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgdw4BfbgDcAhiyQx8ARkEBdbgHNMEOAGUIAL2l4ALN0wxaaMbVyEiIZmzxce%2FIZyatZhx3YXzBQA%3D
  RenbanCandidates: {
    description: defaultExplainer,
    highlights: defaultHighlighter,
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wEYAaETUgd3wAmAL7cAbgEMWSGB2EBdbgHNMEOAGUIAL1l4ALN2JSItOLxQxchIiGZs8XHv3wAGUU1ZDuvAQ4XzhIA%3D%3D%3D
  PalindromeCandidates: {
    description: defaultExplainer,
    highlights: defaultHighlighter,
  },
  // N4IghgThD2DuDOIBcBtUkawMIFMA2eiqoAxtHsgBwA0ImVAvtaecgOy31KVMsVIA2TnEYBdWiQCWEEnhy4CRNCDL8OdEUjYNRO2gDNJADxwATAHIBXALYAjHBCWgADtHiSALpOgA7ZH2QABmFYIKYQADcwPEscZABGXhBXdy9ffxVWJGCNUKRE2iiYuKQAFiSUz28%2FJADskOQAJnCi2OQAVgq3KvTazP4crgBmFui2wS7U6ozVIIay0eL2SZ6ausHNTsKxkp5mZO60tf653OQBRfGAThWjmaz1LgvtpaQtl0PpvtnueefInbnPQgADmEEkpgAypIAF4lG5AA
  ArrowAdvancedCandidates: {
    // TODO: "because it would eliminate all candidates from ${cells}"
    description: defaultExplainer,
    highlights: defaultHighlighter,
  },
  // N4Ig5gTglgJgylAXgUxALgGwBoQGsoA2ByEAwgIZjIDO6A2qBMmFAPYB29oAxqwegAYcEVgHdBAXyw8%2B6AIzCxk6SF780QkCPFo5EgLo5qAVwC28gExTGzNpzQNVs3Yp16Va9BdfyDRs%2BgArAYSQA%3D%3D%3D
  Killer45: {
    description: ({ step: { areas, values, affectedCells, candidates }, constraints, valuesDisplay, affectedCellsDisplay }) => {
      const cell = affectedCells[0]
      const remainingCandidates = candidates![cell.row][cell.col].filter((value) => !values.includes(value))
      const verb = remainingCandidates.length === 1 ? `only keep ${remainingCandidates[0]} in` : `remove ${valuesDisplay} from`
      return ` in ${areaDisplay(areas[0], constraints)} to ${verb} ${affectedCellsDisplay}`
    },
    highlights: ({ step: { areas, affectedCells } }) => [
      areaToCustomGraphicsItem(areas[0]),
      cellToCustomGraphicsItem(affectedCells[0]),
    ],
  },
  // N4Ig5gTglgJgylAXgUxALgCwBoQGsID2ADrlACIEAuAzugNqgDGyANiwIzpMEvoAMOQgHd%2BAXxzM2AJi4hGPdO0EERaPuJAwqAFQCeRVGhAUArgCMWqcU1YdZ83miUhhYibZlpujqctXqcLUo9A3RjAnNLEFEAXVEgA%3D
  KropkiChainCandidates: {
    description: defaultExplainer,
    highlights: ({ step: { areas, affectedCells }, constraints }) => [
      // TODO: somehow highlight the container region areas[0]?
      ...getUniqueAreasCells(areas.slice(1), constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
      cellToCustomGraphicsItem(affectedCells[0]),
    ],
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wFYAaETUgd3wBGAL7cAbgEMWSGPgDMokuSo16eJq3wA2brwF4R4qTPwAWRSDIVqdBiGZs8Adl38hokJOmy87C1ZVbdXtNPAAOV31DT2MfLX9lGzUNRwAGSI4PLxM8AE4E61U7B3x0njc8eKNvfDCCwOSQtIznLNj8J3qk4tCucv066pzDJUKglO0WwZia3y6i4JLnKbbZ%2BIBdbgBzTAg4AGUIAC8fXO4Aa15ic4gAEVJKXEImGBYWQR7m%2FvduRleWABMn1KLQBHjgDwAKgBPYg%2BEAAYTo2BgjCQ1DEsgsfzeH0WoTKenwYN%2B%2FyB%2BK%2BRLwCm4EMoMLh%2BERyNR6IgmJAwnWwiAA
  // TODO: show which cell will become invalid when we have that data
  KropkiAdvancedCandidates: {
    description: ({ step: { areas }, constraints, valuesDisplay, affectedCellsDisplay }) => (
      ` in ${areas.length === 1 ? areaDisplay(areas[0], constraints) : 'a chain of kropki pairs'} to ` +
        `remove ${valuesDisplay} from ${affectedCellsDisplay} because ` +
        `its combinations eliminate all candidates from a cell`
    ),
    highlights: ({ step: { areas, affectedCells }, constraints }) => [
      ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
      cellToCustomGraphicsItem(affectedCells[0]),
    ],
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wAWAL7cAbgEMWSGPgCMwgLrcA5pghwAyhABesvADZulUsQBCpSiZT5KmGcKA%3D%3D
  // TODO: can be improved to show the other row's digits
  TopBottomCandidates: {
    description: ({ step: { areas, values, affectedCells }, constraints, valuesDisplay, affectedCellsDisplay }) => {
      const ascending = (areas[0] as any).Row + 1 === values[0]
      const otherValue = (ascending === ((areas[0] as any).Row < (areas[1] as any).Row)) ? values[0] + 1 : values[0] - 1
      return ` in ${areaDisplay(areas[0], constraints)} to remove ${valuesDisplay} from ${affectedCellsDisplay} because ` +
        `${affectedCells.length !== 1 ? 'they' : 'it'} can't be linked with digit ${otherValue} ` +
        `on ${areaDisplay(areas[1], constraints)}`
    },
    highlights: ({ step: { areas, affectedCells }, constraints }) => [
      ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
      cellToCustomGraphicsItem(affectedCells[0]),
    ],
  },
  // 400000123000000000000000000000000000
  LockedCandidatesPairs: {
    description: defaultExplainer,
    highlights: ({ step: { areas, cells, affectedCells, values }, constraints }) => [
      ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
      ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
    ],
  },
  // N4IghgdgLglg0hGBzAFlEAuKAnArgUwBoQAzGAD3wBMA5XAWwCN9sBnTAbVAAcB7VmLF4RMoAMa8ANpgAMxbLwDusgL7EAbmEkFMAVjU9%2BgmMNEgJ0jAEZ5S1Rq06MANgMg%2BAoSIzipmAEy2yhgyaiCa2viYAOxuHsamPuZ%2BIUGYVmERTgAccUZeZhayaRj%2BmY5RGACceZ4m3r6WAMwlTeWRmG2EhnWJjcUgCsEALO1Oo93u%2BfWFKcMloQ4dGKMAusRI2DBUAMowAF6VNUA%3D
  NakedPairs: {
    description: defaultExplainer,
    highlights: ({ step: { areas, cells, affectedCells, values } }) => [
      areaToCustomGraphicsItem(areas[0]),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
      ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
    ],
  },
  // 000120000000001000002000000000000000
  HiddenPairs: {
    description: hiddenSetsExplainer,
    highlights: ({ step: { areas, cells } }) => [
      areaToCustomGraphicsItem(areas[0]),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell)),
    ],
  },
  // N4IghgdgLglg0jCBzEAuKAnArgUwDQgBmMAHjgCYByWAtgEY4YDOaA2qAA4D2TMsXENKADGXADZoAjAQxcA7mgAMAXwIA3MGNxTVnHnxgChIURNQAmGfKWqQGrTjTndIbr36DUI8U6sLUkrb22qgAzMoAugRIGDDkAMowAF6OqABsykA
  CommonPeerElimination: {
    description: ({ step: { areas }, constraints, valuesDisplay, affectedCellsDisplay, cellsDisplay }) => (
    ` to remove value ${valuesDisplay} from ${affectedCellsDisplay} because it ` +
      `would eliminate it as candidate from ${areaDisplay(areas[0], constraints)} (cells ${cellsDisplay})`
    ),
    highlights: ({ step: { areas, cells, affectedCells } }) => [
      areaToCustomGraphicsItem(areas[0]),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ],
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wCYAaETUgd3wAWAL7cAbgEMWSGPgDsokuSo16eJqw7deAvAFZRISdNn7FIMhWp0GIZmzyDt%2FfAfFSZHc5ZU31dzX1nXTcjD1MAZm9lazUNBwA2YKFDY088dmEAXW4Ac0wIOABlCAAvUwBObgBrXmJqiAARUkpcQiYYFhYARlt7fAAGZLwo7kZOlnY%2BwO7h0ZA4FoAVAE9iUxAAYTpsGEYkajFZc3Gu3v9%2BvCGeFxHDU8nph2udFO5FylX1%2FC2dvYOIEcQNlhEA%3D%3D%3D
  CommonPeerEliminationKropki: {
    description: ({ step: { areas }, constraints, valuesDisplay, affectedCellsDisplay }) => (
      ` to remove ${valuesDisplay} from ${affectedCellsDisplay} because all chain combinations in ${areaDisplay(areas[0], constraints)} would eliminate them`
    ),
    highlights: ({ step: { areas, affectedCells }, constraints }) => [
      ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
      ...uniqWith(affectedCells, isEqual).map((cell) => cellToCustomGraphicsItem(cell)),
    ],
  },
  // N4IghgThD2DuDOIBcBtUkawMIFMA2eiqoAxtHsgBwA0ImyATAL7WnnIDst9SzrIZCkgBs3OIyYBdWiQCWEEnhy4CRNAPZIudcUgCMUqbQBmsgB44AJgDkArgFsARjghrQAB2jxZAF1nQAO2Q2IQBWMVhkAAYWEAA3MDxbHGQDfk9vP0DgjTCI1NiEpJSkAE4WDy9ffyCkENT8pFDCxOSC9Kqs2vqkKMbhFuKC6RAAcwhZSwBlWQAvEvKgA%3D%3D
  CommonPeerEliminationArrow: {
    description: ({ step: { areas }, constraints, valuesDisplay, affectedCellsDisplay }) => (
      ` to remove ${valuesDisplay} from ${affectedCellsDisplay} because all arrow combinations in ${areaDisplay(areas[0], constraints)} would eliminate them`
    ),
    highlights: ({ step: { areas, affectedCells } }) => [
      areaToCustomGraphicsItem(areas[0]),
      ...uniqWith(affectedCells, isEqual).map((cell) => cellToCustomGraphicsItem(cell)),
    ],
  },
  // 123000000000000000000000000000000000
  LockedCandidatesTriples: {
    description: defaultExplainer,
    highlights: ({ step: { areas, cells, affectedCells }, constraints }) => [
      ...getUniqueAreasCells(areas, constraints).map(cell => cellToCustomGraphicsItem(cell, 'area')),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map((cell) => cellToCustomGraphicsItem(cell)),
    ],
  },
  // 000000000000569000009870000003000000004100000005400000006000000007020000008040000
  NakedTriples: {
    description: defaultExplainer,
    highlights: ({ step: { areas, cells, affectedCells } }) => [
      areaToCustomGraphicsItem(areas[0]),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
    ],
  },
  // 000100000000000000000000000010000000020000000030000000001000000002000000003000000
  HiddenTriples: {
    description: hiddenSetsExplainer,
    highlights: ({ step: { areas, cells } }) => [
      areaToCustomGraphicsItem(areas[0]),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell)),
    ],
  },
  // 000000000304567890000020000000000000000000000000002000405678910000000000000000000
  XWing: {
    description: ({ step: { areas }, constraints, cellsDisplay, valuesDisplay, affectedCellsDisplay }) => {
      const areaDisplays = areas.map(area => areaDisplay(area, constraints))
      return ` on cells ${cellsDisplay} (${areaDisplays[0]} and ${areaDisplays[1]}) ` +
        `to remove ${valuesDisplay} from ${affectedCellsDisplay} (${areaDisplays[2]} and ${areaDisplays[3]})`
    },
    highlights: ({ step: { areas, cells, affectedCells, values } }) => [
      ...areas.map(area => areaToCustomGraphicsItem(area)),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
      ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
    ],
  },
  // 401000968070198432800600517002010694140026873000000125004200351050001006010003009
  XYWing: {
    description: ({ step: { values }, cellsDisplay, affectedCellsDisplay }) => (
      ` on cells ${cellsDisplay} to remove ${values[2]} from ${affectedCellsDisplay}`
    ),
    highlights: ({ step: { cells, affectedCells, values } }) => [
      cellToCustomGraphicsItem(cells[0], 'yellow'),
      ...cells.slice(1).map(cell => cellToCustomGraphicsItem(cell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
      ...cells.slice(1).map(cell => buildCornerMarkGraphicsItem(cell, [values[2]], 'red')),
    ],
  },
  // TODO: implement after adding technique
  Swordfish: {
    description: defaultExplainer,
    highlights: () => [],
  },
  // 120734056345000000076000000200000000400000000500000000000000009600000000000008000
  TurbotFish: {
    description: ({ cellDisplays, valuesDisplay, affectedCellsDisplay }) => (
      ` on strong links ${cellDisplays[0]}-${cellDisplays[1]} and ` +
        `${cellDisplays[2]}-${cellDisplays[3]}. Because ${cellDisplays[0]} and ${cellDisplays[2]} ` +
        `see each other, at least one of ${cellDisplays[1]} and ${cellDisplays[3]} will be ${valuesDisplay}, so remove ` +
        `${valuesDisplay} from cells ${affectedCellsDisplay}.`
    ),
    highlights: ({ step: { areas, cells, affectedCells, values } }) => [
      ...areas.map(area => areaToCustomGraphicsItem(area)),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
      ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
    ],
  },
  // 000000008020000700000100000001000300000000400000000500000000000000000800000000900
  EmptyRectangles: {
    description: ({ step: { areas }, constraints, cellDisplays, valuesDisplay, affectedCellsDisplay }) => (
      ` in ${areaDisplay(areas[0], constraints)} that sees strong link ` +
        `${cellDisplays[0]}-${cellDisplays[1]} to remove ${valuesDisplay} from ${affectedCellsDisplay}`
    ),
    highlights: ({ step: { areas, cells, affectedCells, values } }) => [
      ...areas.slice(1).map(area => areaToCustomGraphicsItem(area)),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
      ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
    ],
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wBGAL7cAbgEMWSGPgDMokuSo16eJq3wAWbrwF4R4qTPwAmRSDIVqdBiGZs8AVl38hokJOmyDwgLrcAOaYEHAAyhAAXj4AbNyUABZYKOT4BET2mnhyrvrmnBqOprnuBZmOOTxueOz%2BfsJAA
  AdhocNakedSet: {
    description: defaultExplainer,
    highlights: ({ step: { areas, cells, affectedCells, values } }) => [
      ...areas.map(area => areaToCustomGraphicsItem(area)),
      ...cells.map(otherCell => cellToCustomGraphicsItem(otherCell, 'red')),
      ...affectedCells.map(cell => cellToCustomGraphicsItem(cell)),
      ...cells.map(otherCell => buildCornerMarkGraphicsItem(otherCell, values, 'red')),
    ],
  },
  // TODO: implement after adding technique
  PhistomefelRing: {
    description: defaultExplainer,
    highlights: () => [],
  },
  // N4IgZglgHgpgJgOQK4FsBGMBOBnEAuAbVAAcB7bCAFwlIDt9QBjUgG3wAYAaETUgd3wBGAL7cAbgEMWSGPgDMokuSo16eJq3wAWbrwF4R4qTPwAmRSDIVqdBiGZs8AVl38hokJOmyDwgLrcAOaYEHAAyhAAXj4AbNyUABZYKOT4BET2mnhyrvrmnBqOprnuBZmOOTxueOz%2BfsJAA
  // TODO: can be improved
  NishioForcingChains: {
    description: ({ step, constraints, valuesDisplay, affectedCellsDisplay }) => (
      ` Remove ${valuesDisplay} from cell ${affectedCellsDisplay} because then ${computeInvalidStateReason(step, constraints)}`
    ),
    highlights: ({ step: { invalidStateReason, affectedCells } }) => [
      ...(invalidStateReason ? [areaToCustomGraphicsItem(invalidStateReason.area, 'red')] : []),
      cellToCustomGraphicsItem(affectedCells[0]),
    ],
  },
}

const expandContext = (step: SolutionStep, constraints: SudokuConstraints): StepLogicBaseContext => ({
  step,
  constraints,
  get cellDisplays() {
    return step.cells.map(cell => cellDisplay(cell))
  },
  get cellsDisplay() {
    return step.cells.map(cell => cellDisplay(cell)).join(', ')
  },
  get affectedCellsDisplay() {
    return step.affectedCells.map(cell => cellDisplay(cell)).join(', ')
  },
  get valuesDisplay() {
    return [...step.values].sort().join(', ')
  },
})

export const computeStepDescription = (step: SolutionStep, constraints: SudokuConstraints, hintLevel: HintLevel) => (
  stepsLogic[step.rule].description({
    hintLevel,
    ...expandContext(step, constraints),
  })
)

export const computeStepHighlights = (step: SolutionStep, constraints: SudokuConstraints) => (
  stepsLogic[step.rule].highlights(expandContext(step, constraints))
)
