import { useCallback, useEffect, ChangeEvent } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'src/hooks'
import { useControlCallbacks, useKeyboardHandler } from './hooks'
import {
  addConstraint, changeAntiKnight, changeConstraintType, changeInputActive, changeKillerSum,
  changeKropkiNegative, changePrimaryDiagonal, changeSecondaryDiagonal,
  ConstraintType, initPuzzle,
} from 'src/reducers/admin'
import Radio from 'src/components/Radio'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import Button from 'src/components/Button'
import Checkbox from 'src/components/Checkbox'
import { Typography, Tooltip, } from '@material-tailwind/react'
import PuzzleCommit from './PuzzleCommit'
import { Grid } from 'src/types/sudoku'
import Input from 'src/components/Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

const PuzzleBuilder = () => {
  const { gridSize: paramGridSize } = useParams()
  const gridSize = Number.parseInt(paramGridSize!)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initPuzzle(gridSize))
  }, [dispatch, gridSize])

  const inputActive = useSelector(state => state.admin.inputActive)
  const constraints = useSelector(state => state.admin.constraints)
  const selectedCell = useSelector(state => state.admin.selectedCell)
  const constraintType = useSelector(state => state.admin.constraintType)
  const currentThermo = useSelector(state => state.admin.currentThermo)
  const notes = useSelector(state => state.admin.notes)
  const constraintGrid = useSelector(state => state.admin.constraintGrid!)
  const killerSum = useSelector(state => state.admin.killerSum ?? '')
  const bruteSolution = useSelector(state => state.admin.bruteSolution?.solution)
  const intuitiveSolution = useSelector(state => state.admin.intuitiveSolution?.solution)

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

  if (!constraints) {
    return null
  }

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
  if (constraintType !== ConstraintType.FixedNumber && constraintType !== ConstraintType.Thermo) {
    usedGrid = constraintGrid
    constraintPreview.fixedNumbers = []
  }

  // Visualize solutions while building the puzzle
  let usedNotes = notes!
  const solution = bruteSolution || intuitiveSolution
  if (solution) {
    usedNotes = solution.map(solutionRow => (
      solutionRow.map(digit => digit === 0 ? [] : [ digit! ])
    ))
  }

  return (
    <div className="flex gap-10">
      <SudokuGrid constraints={constraintPreview}
                  grid={usedGrid}
                  notes={usedNotes}
                  selectedCell={selectedCell!}
                  checkErrors={constraintType === ConstraintType.FixedNumber}
                  loading={false}
                  onCellClick={onCellClick}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <Typography variant="h6">
            Constraints
          </Typography>
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
                   'text-red-600': currentThermo.length === 1 || currentThermo.length > gridSize,
                   'text-green-600': _.inRange(currentThermo.length, 2, gridSize + 1),
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
          <div className="flex items-center gap-2">
            <Radio name="build-item"
                  id={ConstraintType.Kropki}
                  label="Kropki"
                  checked={constraintType === ConstraintType.Kropki}
                  onChange={handleConstraintTypeChange} />
            <Tooltip content="1 for consecutive, 2 for double">
              <FontAwesomeIcon icon={faCircleInfo} size="sm" />
            </Tooltip>
          </div>
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
            {[ConstraintType.Thermo, ConstraintType.Regions, ConstraintType.Killer, ConstraintType.Kropki, ConstraintType.ExtraRegions].includes(constraintType) && (
              <Button onClick={handleConstraintAdd}>Add</Button>
            )}
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
      </div>
      <div className="flex flex-col gap-2">
        <PuzzleCommit />
      </div>
    </div>
  )
}

export default PuzzleBuilder
