import { ChangeEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { changeConstraintValue } from 'src/reducers/builder'
import Checkbox from 'src/design_system/Checkbox'
import Tooltip from 'src/design_system/Tooltip'
import type { BooleanConstraintDataKey, ConstraintType } from 'src/types/sudoku'
import { constraintDefinitions } from 'src/constraints/definitions'
import type { ConstraintDataKey } from 'src/constraints/types'
import type { SudokuConstraints } from 'lisudoku-solver'

interface ConstraintCheckboxProps {
  id: ConstraintType
}

function keyIsBooleanConstraintDataKey(key: ConstraintDataKey, constraints: SudokuConstraints | null): key is BooleanConstraintDataKey {
  return constraints !== null && typeof constraints[key] === 'boolean'
}

const ConstraintCheckbox = ({ id, ...props }: ConstraintCheckboxProps) => {
  const dispatch = useDispatch()
  const constraints = useSelector(state => state.builder.constraints)
  const { label, description, icon, dataKey } = constraintDefinitions[id]

  const handleConstraintChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (keyIsBooleanConstraintDataKey(dataKey, constraints)) {
      dispatch(changeConstraintValue({ key: dataKey, value: e.target.checked }))
    } else {
      throw new Error('Expected boolean constraint type.')
    }
  }, [dispatch, dataKey, constraints])

  if (!constraints) {
    return null
  }

  return (
    <Checkbox
      id={id}
      label={<>
        {label}
        {icon && description !== null && (
          <>
            {' '}
            <Tooltip
              content={description({ constraints })}
              placement="bottom"
            >
              {icon}
            </Tooltip>
          </>
        )}
      </>}
      checked={constraints[dataKey]}
      onChange={handleConstraintChange}
      {...props}
    />
  )
}

export default ConstraintCheckbox
