import { useState, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { SudokuConstraints } from 'src/types/constraints'
import { CellPosition } from 'src/types/common'
import { CELL_SIZE } from 'src/utils/constants'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'

const SudokuGrid = ({ gridSize, constraints, onGridChange }: { gridSize: number, constraints: SudokuConstraints, onGridChange: Function }) => {
  const { fixedNumbers } = constraints

  const fixedNumbersGrid = useMemo(() => {
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
    for (const fixedNumber of fixedNumbers) {
      grid[fixedNumber.position.row][fixedNumber.position.col] = fixedNumber.value
    }
    return grid
  }, [gridSize, fixedNumbers])

  const initialGrid = useMemo(() => (
    Array(gridSize).fill(null).map((_row, rowIndex) => Array(gridSize).fill(null).map((_col, colIndex) => (fixedNumbersGrid[rowIndex][colIndex])))
  ), [gridSize, fixedNumbersGrid])
  const [ grid, setGrid ] = useState(initialGrid)
  const [ selectedCell, setSelectedCell ] = useState(null as CellPosition | null)

  useEffect(() => {
    onGridChange(initialGrid)
  }, [onGridChange, initialGrid])

  useEffect(() => {
    const updateSelectedCell = (value: number | null) => {
      const { row, col } = selectedCell!
      const newGrid = [ ...grid ]
      newGrid[row] = [ ...newGrid[row] ]
      newGrid[row][col] = value
      setGrid(newGrid)
      onGridChange(newGrid)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (selectedCell === null || !_.isNil(fixedNumbersGrid[selectedCell.row][selectedCell.col])) {
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
  }, [ gridSize, grid, selectedCell, fixedNumbersGrid, onGridChange ])

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
                      'bg-yellow-200': isSelected(rowIndex, cellIndex),
                    })}
                    style={{
                       width: CELL_SIZE + 'px',
                       height: CELL_SIZE + 'px',
                    }}
                    onClick={() => setSelectedCell({ row: rowIndex, col: cellIndex })}
                >
                  {!_.isNil(fixedNumbersGrid[rowIndex][cellIndex]) ? (
                    <div className="text-black text-4xl font-medium">
                      {fixedNumbersGrid[rowIndex][cellIndex]}
                    </div>
                  ) : (
                    <div className="text-gray-800 text-4xl font-medium">
                      {cell}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <SudokuConstraintsGraphics constraints={constraints} />
      </div>
    </div>
  )
}

export default SudokuGrid
