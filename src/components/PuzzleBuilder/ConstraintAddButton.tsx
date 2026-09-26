import Button from 'src/design_system/Button'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'src/hooks'
import { addConstraint } from 'src/reducers/builder'
import { constraintDefinitions } from 'src/constraints/definitions'
import { ConstraintType } from 'src/types/sudoku'
import Typography from 'src/design_system/Typography'

export const ConstraintAddButton = () => {
  const dispatch = useDispatch()
  const constraints = useSelector(state => state.builder.constraints)
  const editorState = useSelector(state => state.builder.constraintEditorState)

  if (!constraints) {
    return null
  }

  const validationResult = constraintDefinitions[editorState.type].validateCurrentConstraint({
    editorState,
    constraints,
  })

  return (
    <div className="flex flex-col">
      <Button
        onClick={() => dispatch(addConstraint())}
        className={classNames({
          'bg-red-600': validationResult.type === 'error',
          'bg-green-600': validationResult.type === 'success',
        })}
        disabled={['info', 'error'].includes(validationResult.type)}
        data-hb-name="constraint-add"
      >
        {editorState.type === ConstraintType.Regions ? 'Set' : 'Add'}
      </Button>
      {['success', 'info', 'error'].includes(validationResult.type) && (
        <Typography
          variant="small"
          className={classNames({ 'text-secondary': validationResult.type === 'info' })}
        >
          {validationResult.message}
        </Typography>
      )}
    </div>
  )
}
