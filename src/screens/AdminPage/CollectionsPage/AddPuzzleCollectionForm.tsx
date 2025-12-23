import { useCallback } from 'react'
import { Form, Field } from 'react-final-form'
import { FormApi } from 'final-form'
import Button from 'src/design_system/Button'
import Input from 'src/design_system/Input'
import { useDispatch, useSelector } from 'src/hooks'
import { createdPuzzleCollection } from 'src/reducers/collections'
import { createPuzzleCollection, PuzzleCollectionInput } from 'src/utils/apiService'

const AddPuzzleCollectionForm = () => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token!)

  const onSubmit = useCallback(async (values: Record<string, any>, form: FormApi) => {
    const puzzleCollection: PuzzleCollectionInput = {
      name: values.name,
      url: values.url,
    }
    const result = await createPuzzleCollection(puzzleCollection, userToken)

    if (result.error) {
      return
    }

    dispatch(createdPuzzleCollection(result))
    form.reset()
  }, [dispatch, userToken])

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, submitError, submitting, values }) => (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <div>
            <Field name="name">
              {props => (
                <Input {...props.input} label="Name" className="w-96" />
              )}
            </Field>
          </div>

          <div>
            <Field name="url">
              {props => (
                <Input {...props.input} label="URL" className="w-96" />
              )}
            </Field>
          </div>

          <div>
            {submitError && <div className="text-red-600">{submitError}</div>}
            <div className="flex items-end h-full">
              <Button
                type="submit"
                disabled={submitting || values.name === undefined || values.url === undefined}
                className="h-10 py-1 px-8 text-lg"
              >
                Add
              </Button>
            </div>
          </div>
        </form>
      )}
    />
  )
}

export default AddPuzzleCollectionForm
