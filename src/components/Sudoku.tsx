import { useState, useEffect } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { Region, SudokuConstraints } from 'src/types/constraints'
import { CellPosition } from 'src/types/common'
import { CELL_SIZE } from 'src/utils/constants'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'

const computeRegionSizes = (gridSize: number) => {
  if (gridSize === 4) {
    return [ 2, 2 ]
  } else if (gridSize === 6) {
    return [ 2, 3 ]
  } else {
    return [ 3, 3 ]
  }
}

const ensureDefaultRegions = (regions: Region[] | undefined, gridSize: number): Region[] => {
  if (regions) {
    return regions
  }

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

const Sudoku = ({ gridSize, constraints }: { gridSize: number, constraints: SudokuConstraints }) => {
  const [ grid, setGrid ] = useState(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)))
  const [ selectedCell, setSelectedCell ] = useState(null as CellPosition | null)
  const { fixedNumbers } = constraints
  let { regions: initialRegions } = constraints
  const regions = ensureDefaultRegions(initialRegions, gridSize)

  useEffect(() => {
    const updateSelectedCell = (value: number | null) => {
      const { row, col } = selectedCell!
      const newGrid = [ ...grid ]
      newGrid[row] = [ ...newGrid[row] ]
      newGrid[row][col] = value
      setGrid(newGrid)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (selectedCell === null || fixedNumbers && !_.isNil(fixedNumbers[selectedCell.row][selectedCell.col])) {
        return
      }

      if (e.key === 'Backspace') {
        updateSelectedCell(null)
        return
      }

      const value = parseInt(e.key)
      if (Number.isNaN(value)) {
        return
      }

      if (!_.inRange(value, 1, gridSize + 1)) {
        return
      }

      updateSelectedCell(value)
    }
    window.addEventListener('keydown', handleKey)

    return () => window.removeEventListener('keydown', handleKey)
  }, [ gridSize, grid, selectedCell ])

  const isSelected = (rowIndex: number, cellIndex: number) => (
    selectedCell !== null && rowIndex === selectedCell.row && cellIndex === selectedCell.col
  )

  return (
    <div className="p-20">
      <div className="relative">
        <div className="w-fit relative border">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex}
                className="flex w-fit">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex}
                    className={classNames(`flex justify-center items-center border-solid border-grey-400 border`, {
                      'bg-yellow-100': isSelected(rowIndex, cellIndex),
                    })}
                    style={{
                       width: CELL_SIZE + 'px',
                       height: CELL_SIZE + 'px',
                    }}
                    onClick={() => setSelectedCell({ row: rowIndex, col: cellIndex })}
                >
                  {fixedNumbers && !_.isNil(fixedNumbers[rowIndex][cellIndex]) ? (
                    <div className="text-black text-3xl">
                      {fixedNumbers[rowIndex][cellIndex]}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-3xl">
                      {cell}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <SudokuConstraintsGraphics gridSize={gridSize} regions={regions} />
      </div>
    </div>
  )
}

export default Sudoku
