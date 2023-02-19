import { useCallback, useEffect, ChangeEvent } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'src/hooks'
import { useControlCallbacks, useKeyboardHandler } from './hooks'
import {
  addConstraint, changeAntiKnight, changeConstraintType, changeInputActive, changeKillerSum,
  changeKropkiNegative, changePrimaryDiagonal, changeSecondaryDiagonal,
  ConstraintType, initPuzzle, receivedPuzzle,
} from 'src/reducers/builder'
import Radio from 'src/components/Radio'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import Button from 'src/components/Button'
import Checkbox from 'src/components/Checkbox'
import { Typography, } from '@material-tailwind/react'
import PuzzleActions from './PuzzleActions'
import { Grid } from 'src/types/sudoku'
import Input from 'src/components/Input'
import { importPuzzle, ImportResult } from 'src/utils/import'
import GridSizeSelect from './GridSizeSelect'
import { computeCellSize } from 'src/utils/misc'
import { useWindowWidth } from '@react-hook/window-size'

const PuzzleBuilder = ({ admin }: { admin: boolean }) => {
  const { gridSize: paramGridSize } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    const gridSize = Number.parseInt(paramGridSize ?? '9')
    dispatch(initPuzzle({ gridSize, setterMode: admin }))
  }, [dispatch, paramGridSize, admin])

  const setterMode = useSelector(state => state.builder.setterMode)
  const inputActive = useSelector(state => state.builder.inputActive)
  const constraints = useSelector(state => state.builder.constraints)
  const selectedCells = useSelector(state => state.builder.selectedCells)
  const constraintType = useSelector(state => state.builder.constraintType)
  const currentThermo = useSelector(state => state.builder.currentThermo)
  const notes = useSelector(state => state.builder.notes)
  const constraintGrid = useSelector(state => state.builder.constraintGrid!)
  const killerSum = useSelector(state => state.builder.killerSum ?? '')
  const bruteSolution = useSelector(state => state.builder.bruteSolution?.solution)
  const logicalSolution = useSelector(state => state.builder.logicalSolution?.solution)
  const gridSize = constraints?.gridSize

  useEffect(() => {
    if (gridSize && setterMode) {
      window.history.pushState(null , '', `/admin/build/${gridSize}`)
    }
  }, [gridSize, setterMode])

  const { onCellClick } = useControlCallbacks()
  useKeyboardHandler(!inputActive)

  const handleInputFocus = useCallback(() => {
    dispatch(changeInputActive(true))
  }, [dispatch])
  const handleInputBlur = useCallback(() => {
    dispatch(changeInputActive(false))
  }, [dispatch])

  const handleConstraintTypeChange = useCallback((id: string) => {
    dispatch(changeConstraintType(id))
  }, [dispatch])

  const handleConstraintAdd = useCallback(() => {
    dispatch(addConstraint())
  }, [dispatch])

  const handlePrimaryDiagonalChange = useCallback((e: ChangeEvent<HTMLInputElement>) => (
    dispatch(changePrimaryDiagonal(e.target.checked))
  ), [dispatch])

  const handleSecondaryDiagonalChange = useCallback((e: ChangeEvent<HTMLInputElement>) => (
    dispatch(changeSecondaryDiagonal(e.target.checked))
  ), [dispatch])

  const handleAntiKnightChange = useCallback((e: ChangeEvent<HTMLInputElement>) => (
    dispatch(changeAntiKnight(e.target.checked))
  ), [dispatch])

  const handleKillerSumChange = useCallback((sum: number | null) => {
    dispatch(changeKillerSum(sum))
  }, [dispatch])

  const handleKropkiNegativeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => (
    dispatch(changeKropkiNegative(e.target.checked))
  ), [dispatch])

  const handleImportClick = useCallback(() => {
    const LISUDOKU_EXAMPLE = 'https://lisudoku.xyz/p/4pyPjYdnlzJyUvFPVToy'
    const FPUZZLES_EXAMPLE = 'https://www.f-puzzles.com/?load=N4IgzglgXgpiB...(long url)'
    const url = window.prompt(`Enter puzzle URL. Examples:\n${LISUDOKU_EXAMPLE}\n${FPUZZLES_EXAMPLE}`)
    if (url != null) {
      importPuzzle(url).then((result: ImportResult) => {
        if (result.error) {
          alert(result.message)
        } else {
          dispatch(receivedPuzzle(result.constraints!))
          if (result.alert) {
            alert(result.message)
          }
        }
      })
    }
  }, [dispatch])

  // Calculate the available screen width and subtract parent paddings
  const width = useWindowWidth()
  const availableWidth = width - 40

  if (!constraints) {
    return null
  }

  const cellSize = computeCellSize(gridSize!, availableWidth)

  let thermos = constraints?.thermos ?? []
  if (currentThermo.length > 0) {
    thermos = [ ...thermos, currentThermo ]
  }
  const constraintPreview = {
    ...constraints,
    thermos,
  }

  // Not really used, but SudokuGrid needs them... there are better solutions
  const grid: Grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))

  let usedGrid = grid
  if (constraintType === ConstraintType.Regions) {
    usedGrid = constraintGrid
    constraintPreview.fixedNumbers = []
  }

  // Visualize solutions while building the puzzle
  let usedNotes = notes!
  const solution = bruteSolution || logicalSolution
  if (solution) {
    usedNotes = solution.map(solutionRow => (
      solutionRow.map(digit => digit === 0 ? [] : [ digit! ])
    ))
  }

  return (
    <div className="flex flex-wrap gap-10 w-full">
      <SudokuGrid cellSize={cellSize}
                  constraints={constraintPreview}
                  grid={usedGrid}
                  notes={usedNotes}
                  selectedCells={selectedCells}
                  checkErrors={constraintType === ConstraintType.FixedNumber}
                  loading={false}
                  onCellClick={onCellClick}
      />
      <div className="flex flex-col gap-2 w-full xl:max-w-[280px]">
        <div className="flex flex-col">
          <Typography variant="h6">
            Constraints
          </Typography>
          <div className="flex flex-wrap gap-x-3">
            <Radio name="build-item"
                  id={ConstraintType.FixedNumber}
                  label="Given Digit"
                  checked={constraintType === ConstraintType.FixedNumber}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.Thermo}
                  label="Thermometer"
                  checked={constraintType === ConstraintType.Thermo}
                  labelProps={{ className: classNames('text-white', {
                    'text-red-600': currentThermo.length === 1 || currentThermo.length > gridSize!,
                    'text-green-600': _.inRange(currentThermo.length, 2, gridSize! + 1),
                  })}}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.Regions}
                  label="Regions"
                  checked={constraintType === ConstraintType.Regions}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.ExtraRegions}
                  label="Extra Regions"
                  checked={constraintType === ConstraintType.ExtraRegions}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.Killer}
                  label="Killer"
                  checked={constraintType === ConstraintType.Killer}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.KropkiConsecutive}
                  label="Kropki Consecutive"
                  checked={constraintType === ConstraintType.KropkiConsecutive}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.KropkiDouble}
                  label="Kropki Double"
                  checked={constraintType === ConstraintType.KropkiDouble}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.OddCells}
                  label="Odd"
                  checked={constraintType === ConstraintType.OddCells}
                  onChange={handleConstraintTypeChange} />
            <Radio name="build-item"
                  id={ConstraintType.EvenCells}
                  label="Even"
                  checked={constraintType === ConstraintType.EvenCells}
                  onChange={handleConstraintTypeChange} />
            <div className="flex flex-col w-full mt-2 gap-y-1">
              {constraintType === ConstraintType.Killer && (
                <Input label="Sum"
                      type="number"
                      value={killerSum}
                      onChange={handleKillerSumChange}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                />
              )}
              {[ConstraintType.Thermo, ConstraintType.Regions, ConstraintType.Killer,
                ConstraintType.KropkiConsecutive, ConstraintType.KropkiDouble, ConstraintType.ExtraRegions].includes(constraintType) && (
                <Button onClick={handleConstraintAdd}>Add</Button>
              )}
            </div>
          </div>
        </div>
        <hr />
        <div className="flex flex-col">
          <Checkbox id="primary-diagonal"
                    label="Primary Diagonal"
                    checked={constraints.primaryDiagonal}
                    onChange={handlePrimaryDiagonalChange} />
          <Checkbox id="secondary-diagonal"
                    label="Secondary Diagonal"
                    checked={constraints.secondaryDiagonal}
                    onChange={handleSecondaryDiagonalChange} />
          <Checkbox id="anti-knight"
                    label="Anti Knight"
                    checked={constraints.antiKnight}
                    onChange={handleAntiKnightChange} />
          <Checkbox id="kropki-negative"
                    label="Kropki Negative"
                    checked={constraints.kropkiNegative}
                    onChange={handleKropkiNegativeChange} />
        </div>
        <hr />
        <Button variant="outlined" onClick={handleImportClick}>Import</Button>
        <GridSizeSelect />
      </div>
      <div className="flex flex-col w-full xl:w-80 2xl:w-96 gap-2">
        <PuzzleActions />
      </div>
    </div>
  )
}

export default PuzzleBuilder