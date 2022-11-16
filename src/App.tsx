import { useState } from 'react'
import _ from 'lodash'
import SudokuGrid from './components/SudokuGrid'
import { Region, SudokuConstraints, Thermo } from './types/constraints'
import CheckButton from './components/CheckButton'
import SolveButton from './components/SolveButton'
import { CellPosition } from './types/common'

const computeRegionSizes = (gridSize: number) => {
  if (gridSize === 4) {
    return [ 2, 2 ]
  } else if (gridSize === 6) {
    return [ 2, 3 ]
  } else {
    return [ 3, 3 ]
  }
}

const ensureDefaultRegions = (gridSize: number): Region[] => {
  const [ regionHeight, regionWidth ] = computeRegionSizes(gridSize)
  const defaultRegions: Region[] = _.flatten(
    _.times(gridSize / regionHeight, regionRowIndex => (
      _.times(gridSize / regionWidth, regionColIndex => (
        _.flattenDeep(
          _.times(regionHeight, rowIndex => (
            _.times(regionWidth, colIndex => (
              {
                row: regionRowIndex * regionHeight + rowIndex,
                col: regionColIndex * regionWidth + colIndex,
              } as CellPosition
            ))
          ))
        )
      ))
    ))
  )

  return defaultRegions
}

// 4x4 example
// const gridSize = 4
// const fixedNumbers = [
//   {
//     position: {
//       row: 1,
//       col: 1,
//     },
//     value: 4,
//   },
//   {
//     position: {
//       row: 1,
//       col: 3,
//     },
//     value: 2,
//   },
//   {
//     position: {
//       row: 2,
//       col: 0,
//     },
//     value: 1,
//   },
//   {
//     position: {
//       row: 2,
//       col: 2,
//     },
//     value: 3,
//   },
// ]

// 6x6 example
// const gridSize = 6
// const fixedNumbers = [
//   {
//     position: { row: 0, col: 0 },
//     value: 6,
//   },
//   {
//     position: { row: 1, col: 0 },
//     value: 1,
//   },
//   {
//     position: { row: 1, col: 1 },
//     value: 4,
//   },
//   {
//     position: { row: 2, col: 1 },
//     value: 1,
//   },
//   {
//     position: { row: 2, col: 2 },
//     value: 2,
//   },
//   {
//     position: { row: 2, col: 3 },
//     value: 5,
//   },
//   {
//     position: { row: 2, col: 5 },
//     value: 6,
//   },
//   {
//     position: { row: 3, col: 0 },
//     value: 5,
//   },
//   {
//     position: { row: 3, col: 2 },
//     value: 6,
//   },
//   {
//     position: { row: 3, col: 3 },
//     value: 2,
//   },
//   {
//     position: { row: 3, col: 4 },
//     value: 1,
//   },
//   {
//     position: { row: 4, col: 4 },
//     value: 2,
//   },
//   {
//     position: { row: 4, col: 5 },
//     value: 1,
//   },
//   {
//     position: { row: 5, col: 5 },
//     value: 3,
//   },
// ]
// const thermos: Thermo[] = []

// WSC booklet 6x6 thermo https://uploads-ssl.webflow.com/62793457876c001d28edf162/6348945a45b06acb414391b7_WSC_2022_IB_v2.1.pdf
// const gridSize = 6
// const fixedNumbers = [
//   {
//     position: { row: 1, col: 0 },
//     value: 4,
//   },
//   {
//     position: { row: 2, col: 0 },
//     value: 5,
//   },
//   {
//     position: { row: 4, col: 5 },
//     value: 2,
//   },
//   {
//     position: { row: 5, col: 4 },
//     value: 4,
//   },
//   {
//     position: { row: 5, col: 5 },
//     value: 3,
//   },
// ]
// const thermos = [
//   [
//     { row: 0, col: 0 },
//     { row: 0, col: 1 },
//     { row: 0, col: 2 },
//     { row: 0, col: 3 },
//     { row: 0, col: 4 },
//     { row: 0, col: 5 },
//   ],
//   [
//     { row: 1, col: 4 },
//     { row: 2, col: 4 },
//     { row: 3, col: 4 },
//   ],
//   [
//     { row: 2, col: 2 },
//     { row: 3, col: 2 },
//     { row: 4, col: 2 },
//     { row: 4, col: 3 },
//   ],
//   [
//     { row: 3, col: 0 },
//     { row: 4, col: 0 },
//     { row: 5, col: 0 },
//   ],
//   [
//     { row: 3, col: 3 },
//     { row: 2, col: 3 },
//     { row: 1, col: 3 },
//     { row: 1, col: 2 },
//   ],
// ]

// UK Sudoku Championship 2022 - 9x9 thermo
// const gridSize = 9
// const fixedNumbers = [
//   {
//     position: { row: 1, col: 3 },
//     value: 7,
//   },
//   {
//     position: { row: 2, col: 3 },
//     value: 3,
//   },
//   {
//     position: { row: 3, col: 3 },
//     value: 5,
//   },
//   {
//     position: { row: 5, col: 5 },
//     value: 3,
//   },
//   {
//     position: { row: 6, col: 5 },
//     value: 7,
//   },
//   {
//     position: { row: 7, col: 5 },
//     value: 5,
//   },
// ]
// const thermos = [
//   [
//     { row: 0, col: 5 },
//     { row: 0, col: 6 },
//     { row: 0, col: 7 },
//     { row: 1, col: 8 },
//     { row: 2, col: 8 },
//   ],
//   [
//     { row: 1, col: 4 },
//     { row: 2, col: 4 },
//     { row: 3, col: 4 },
//     { row: 4, col: 3 },
//     { row: 5, col: 2 },
//   ],
//   [
//     { row: 2, col: 2 },
//     { row: 2, col: 1 },
//     { row: 3, col: 1 },
//     { row: 4, col: 1 },
//     { row: 4, col: 0 },
//   ],
//   [
//     { row: 6, col: 0 },
//     { row: 7, col: 0 },
//     { row: 8, col: 1 },
//     { row: 8, col: 2 },
//     { row: 8, col: 3 },
//   ],
//   [
//     { row: 6, col: 6 },
//     { row: 6, col: 7 },
//     { row: 5, col: 7 },
//     { row: 4, col: 7 },
//     { row: 4, col: 8 },
//   ],
//   [
//     { row: 7, col: 4 },
//     { row: 6, col: 4 },
//     { row: 5, col: 4 },
//     { row: 4, col: 5 },
//     { row: 3, col: 6 },
//   ],
// ]

// UK Sudoku Championship 2022 booklet - 9x9 thermo https://ukpuzzles.org/file_download.php?fileid=247&md5=c200e06d8822177932d906103919ceba
const gridSize = 9
const fixedNumbers = [
  {
    position: { row: 2, col: 2 },
    value: 2,
  },
  {
    position: { row: 2, col: 6 },
    value: 4,
  },
  {
    position: { row: 3, col: 4 },
    value: 5,
  },
  {
    position: { row: 5, col: 4 },
    value: 1,
  },
  {
    position: { row: 6, col: 2 },
    value: 9,
  },
  {
    position: { row: 6, col: 6 },
    value: 5,
  },
]
const thermos: Thermo[] = [
  [
    { row: 0, col: 6 },
    { row: 0, col: 5 },
    { row: 0, col: 4 },
    { row: 0, col: 3 },
    { row: 0, col: 2 },
    { row: 0, col: 1 },
    { row: 0, col: 0 },
  ],
  [
    { row: 2, col: 0 },
    { row: 3, col: 0 },
    { row: 4, col: 0 },
    { row: 5, col: 0 },
    { row: 6, col: 0 },
    { row: 7, col: 0 },
    { row: 8, col: 0 },
  ],
  [
    { row: 2, col: 5 },
    { row: 2, col: 4 },
    { row: 2, col: 3 },
  ],
  [
    { row: 3, col: 2 },
    { row: 4, col: 2 },
    { row: 5, col: 2 },
  ],
  [
    { row: 5, col: 6 },
    { row: 4, col: 6 },
    { row: 3, col: 6 },
  ],
  [
    { row: 6, col: 3 },
    { row: 6, col: 4 },
    { row: 6, col: 5 },
  ],
  [
    { row: 6, col: 8 },
    { row: 5, col: 8 },
    { row: 4, col: 8 },
    { row: 3, col: 8 },
    { row: 2, col: 8 },
    { row: 1, col: 8 },
    { row: 0, col: 8 },
  ],
  [
    { row: 8, col: 2 },
    { row: 8, col: 3 },
    { row: 8, col: 4 },
    { row: 8, col: 5 },
    { row: 8, col: 6 },
    { row: 8, col: 7 },
    { row: 8, col: 8 },
  ],
]

const regions = ensureDefaultRegions(gridSize)
const constraints: SudokuConstraints = {
  gridSize,
  fixedNumbers,
  regions,
  thermos,
}

const gridIsFull = (grid: number[][] | undefined) => grid && grid.every(row => row.every(x => !!x))

const App = () => {
  const [ grid, setGrid ] = useState<number[][]>()

  return (
    <div className="App">
      <SudokuGrid gridSize={gridSize} constraints={constraints} onGridChange={setGrid} />
      {gridIsFull(grid) && (
        <CheckButton grid={grid!} constraints={constraints} />
      )}
      <SolveButton constraints={constraints} />
    </div>
  );
}

export default App
