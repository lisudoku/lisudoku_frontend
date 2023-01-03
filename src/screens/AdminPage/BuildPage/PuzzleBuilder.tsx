import { useCallback, useEffect, ChangeEvent } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'src/hooks'
import { useControlCallbacks, useKeyboardHandler } from './hooks'
import {
  addConstraint, changeAntiKnight, changeConstraintType, changePrimaryDiagonal, changeSecondaryDiagonal,
  ConstraintType, initPuzzle,
} from 'src/reducers/admin'
import Radio from 'src/components/Radio'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import Button from 'src/components/Button'
import Checkbox from 'src/components/Checkbox'
import { Typography } from '@material-tailwind/react'
import PuzzleCommit from './PuzzleCommit'

const PuzzleBuilder = () => {
  const { gridSize: paramGridSize } = useParams()
  const gridSize = Number.parseInt(paramGridSize!)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initPuzzle(gridSize))
  }, [dispatch, gridSize])

  const constraints = useSelector(state => state.admin.constraints)
  const selectedCell = useSelector(state => state.admin.selectedCell)
  const constraintType = useSelector(state => state.admin.constraintType)
  const currentThermo = useSelector(state => state.admin.currentThermo)
  const notes = useSelector(state => state.admin.notes)

  // Not really used, but SudokuGrid needs them... there are better solutions
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))

  const { onCellClick } = useControlCallbacks()
  useKeyboardHandler()

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

  return (
    <div className="flex gap-10">
      <SudokuGrid constraints={constraintPreview}
                  grid={grid}
                  notes={notes!}
                  selectedCell={selectedCell!}
                  checkErrors
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
                 color="cyan"
                 checked={constraintType === ConstraintType.FixedNumber}
                 onChange={handleConstraintTypeChange} />
          <Radio name="build-item"
                 id={ConstraintType.Thermo}
                 label="Thermometer"
                 color="cyan"
                 checked={constraintType === ConstraintType.Thermo}
                 labelProps={{ className: classNames({
                   'text-red-600': currentThermo.length === 1 || currentThermo.length > gridSize,
                   'text-green-600': _.inRange(currentThermo.length, 2, gridSize + 1),
                 })}}
                 onChange={handleConstraintTypeChange} />
          <Radio name="build-item"
                 label="Regions"
                 color="cyan"
                 disabled
                 labelProps={{ className: 'line-through' }} />
          {constraintType === ConstraintType.Thermo && (
            <Button onClick={handleConstraintAdd}>Add</Button>
          )}
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
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <PuzzleCommit />
      </div>
    </div>
  )
}

export default PuzzleBuilder
