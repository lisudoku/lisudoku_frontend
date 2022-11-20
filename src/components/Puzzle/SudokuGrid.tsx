import { useMemo } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { CellPosition } from 'src/types/sudoku'
import { CELL_SIZE } from 'src/utils/constants'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'
import { useFixedNumbersGrid } from './hooks'

const isSelected = (rowIndex: number, cellIndex: number, selectedCell: CellPosition | null) => (
  selectedCell !== null && rowIndex === selectedCell.row && cellIndex === selectedCell.col
)

const SudokuGrid = ({ constraints, grid, notes, selectedCell, onSelectedCellChange }: SudokuGridProps) => {
  const { fixedNumbers, gridSize } = constraints

  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)

  return (
    <div className="p-2 cursor-default">
      <div className="relative">
        <div className="w-fit relative border">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex}
                className="flex w-fit">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex}
                     className={classNames(`flex justify-center items-center border-solid border-neutral-500 border`, {
                       'bg-neutral-600': isSelected(rowIndex, cellIndex, selectedCell),
                     })}
                     style={{
                       width: CELL_SIZE + 'px',
                       height: CELL_SIZE + 'px',
                     }}
                     onClick={() => onSelectedCellChange({ row: rowIndex, col: cellIndex })}
                >
                  {!_.isNil(fixedNumbersGrid[rowIndex][cellIndex]) ? (
                    <div className="text-4xl font-medium">
                      {fixedNumbersGrid[rowIndex][cellIndex]}
                    </div>
                  ) : (
                    <div className="text-neutral-300 text-4xl font-medium">
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

type SudokuGridProps = {
  constraints: SudokuConstraints,
  grid: Grid,
  notes: number[][][],
  selectedCell: CellPosition | null,
  onSelectedCellChange: Function,
}

export default SudokuGrid
