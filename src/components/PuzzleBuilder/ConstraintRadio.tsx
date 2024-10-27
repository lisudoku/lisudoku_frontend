import { RadioProps } from '@material-tailwind/react'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { changeConstraintType } from 'src/reducers/builder'
import Radio from 'src/shared/Radio'
import Tooltip from 'src/shared/Tooltip'
import { ConstraintType } from 'src/types/sudoku'
import { CONSTRAINTS_DISPLAY } from 'src/utils/constraints'

interface ConstraintRadioProps {
  id: ConstraintType
  labelProps?: RadioProps['labelProps']
}

const ConstraintRadio = ({ id, ...props }: ConstraintRadioProps) => {
  const dispatch = useDispatch()
  const constraints = useSelector(state => state.builder.constraints)
  const checkedConstraint = useSelector(state => state.builder.constraintType)

  const handleConstraintChange = useCallback((id: string) => {
    dispatch(changeConstraintType(id))
  }, [dispatch])

  if (!constraints) {
    return null
  }

  const { label, description, icon } = CONSTRAINTS_DISPLAY[id]

  return (
    <Radio
      id={id}
      label={<>
        {label}
        {icon && (
          <>
            {' '}
            <Tooltip
              content={description(constraints)}
              placement="bottom"
            >
              {icon}
            </Tooltip>
          </>
        )}
      </>}
      checked={checkedConstraint === id}
      onChange={handleConstraintChange}
      {...props}
    />
  )
}

export default ConstraintRadio
