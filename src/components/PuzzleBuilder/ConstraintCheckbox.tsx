import { ChangeEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { changeConstraintValue } from 'src/reducers/builder'
import Checkbox from 'src/design_system/Checkbox'
import Tooltip from 'src/design_system/Tooltip'
import { BooleanConstraintKeyType, ConstraintType } from 'src/types/sudoku'
import { constraintDefinitions } from 'src/constraints/definitions'

interface ConstraintCheckboxProps {
  id: ConstraintType
  keyField: BooleanConstraintKeyType
}

const ConstraintCheckbox = ({ id, keyField, ...props }: ConstraintCheckboxProps) => {
  const dispatch = useDispatch()
  const constraints = useSelector(state => state.builder.constraints)

  const handleConstraintChange = useCallback((e: ChangeEvent<HTMLInputElement>) => (
    dispatch(changeConstraintValue({ key: keyField, value: e.target.checked }))
  ), [dispatch, keyField])

  if (!constraints) {
    return null
  }

  const { label, description, icon } = constraintDefinitions[id]

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
      checked={constraints[keyField]}
      onChange={handleConstraintChange}
      {...props}
    />
  )
}

export default ConstraintCheckbox
