import { useState, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { SudokuConstraints } from 'src/types/constraints'
import { CellPosition } from 'src/types/common'
import { CELL_SIZE } from 'src/utils/constants'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

const SudokuGrid = ({ gridSize, constraints, onGridChange, onNotesActiveToggle }: { gridSize: number, constraints: SudokuConstraints, onGridChange: Function, onNotesActiveToggle: Function }) => {
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
  const [ selectedCell, setSelectedCell ] = useState<CellPosition | null>(null)

  const initialNotes = useMemo(() => (
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => new Set<number>()))
  ), [gridSize])
  const [ notesActive, setNotesActive ] = useState<boolean>(false)
  const [ notes, setNotes ] = useState<Set<number>[][]>(initialNotes)

  useEffect(() => {
    onGridChange(initialGrid)
  }, [onGridChange, initialGrid])

  useEffect(() => {
    const updateSelectedCellValue = (value: number | null) => {
      const { row, col } = selectedCell!
      const newGrid = [ ...grid ]
      newGrid[row] = [ ...newGrid[row] ]
      if (newGrid[row][col] === value) {
        newGrid[row][col] = null
      } else {
        newGrid[row][col] = value
        updateSelectedCellNotes(null)
      }
      setGrid(newGrid)
      onGridChange(newGrid)
    }

    const updateSelectedCellNotes = (value: number | null) => {
      const { row, col } = selectedCell!
      if (value === null && notes[row][col].size === 0) {
        return
      }
      if (grid[row][col] !== null) {
        return
      }
      const newNotes = [ ...notes ]
      newNotes[row] = [ ...newNotes[row] ]
      if (value === null) {
        newNotes[row][col].clear()
      } else if (newNotes[row][col].has(value)) {
        newNotes[row][col].delete(value)
      } else {
        newNotes[row][col].add(value)
      }
      setNotes(newNotes)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (ARROWS.includes(e.key) && selectedCell !== null) {
        const dir = ARROWS.indexOf(e.key)
        setSelectedCell(selectedCell => ({
          row: (selectedCell!.row + dirRow[dir] + gridSize) % gridSize,
          col: (selectedCell!.col + dirCol[dir] + gridSize) % gridSize,
        }))
        return
      }

      if (e.key.toLowerCase() === 'n') {
        onNotesActiveToggle()
        setNotesActive(active => {
          return !active
        })
        return
      }

      if (selectedCell === null || !_.isNil(fixedNumbersGrid[selectedCell.row][selectedCell.col])) {
        return
      }

      if (e.key === 'Backspace') {
        updateSelectedCellValue(null)
        updateSelectedCellNotes(null)
        return
      }

      const value = parseInt(e.key)
      if (Number.isNaN(value)) {
        return
      }

      if (!_.inRange(value, 1, gridSize + 1)) {
        return
      }

      if (notesActive) {
        updateSelectedCellNotes(value)
      } else {
        updateSelectedCellValue(value)
      }
    }
    window.addEventListener('keydown', handleKey)

    return () => window.removeEventListener('keydown', handleKey)
  }, [ gridSize, grid, selectedCell, fixedNumbersGrid, onGridChange, notesActive, onNotesActiveToggle, notes ])

  const isSelected = (rowIndex: number, cellIndex: number) => (
    selectedCell !== null && rowIndex === selectedCell.row && cellIndex === selectedCell.col
  )

  return (
    <div className="p-20 cursor-default">
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
        <SudokuConstraintsGraphics constraints={constraints} notes={notes} />
      </div>
    </div>
  )
}

export default SudokuGrid
