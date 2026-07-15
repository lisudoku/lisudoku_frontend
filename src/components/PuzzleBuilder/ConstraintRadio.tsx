import { RadioProps } from '@material-tailwind/react'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { changeConstraintType } from 'src/reducers/builder'
import Radio from 'src/design_system/Radio'
import Tooltip from 'src/design_system/Tooltip'
import { ConstraintType } from 'src/types/sudoku'
import { constraintDefinitions } from 'src/constraints/definitions'
import classNames from 'classnames'

interface ConstraintRadioProps {
  id: ConstraintType
  labelProps?: RadioProps['labelProps']
}

const ConstraintRadio = ({ id, ...props }: ConstraintRadioProps) => {
  const dispatch = useDispatch()
  const constraints = useSelector(state => state.builder.constraints)
  const editorState = useSelector(state => state.builder.constraintEditorState)

  const handleConstraintChange = useCallback((id: string) => {
    dispatch(changeConstraintType(id))
  }, [dispatch])

  const { label, description, icon, validateCurrentConstraint } = constraintDefinitions[id]
  let validationResult
  if (editorState.type === id && constraints) {
    validationResult = validateCurrentConstraint({
      editorState,
      constraints,
    })
  }

  if (!constraints) {
    return null
  }

  return (
    <Radio
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
      checked={editorState.type === id}
      onChange={handleConstraintChange}
      labelProps={{
        className: classNames({
          'text-red-600': validationResult?.type === 'error',
          'text-green-600': validationResult?.type === 'success',
        })
      }}
      {...props}
    />
  )
}

export default ConstraintRadio
