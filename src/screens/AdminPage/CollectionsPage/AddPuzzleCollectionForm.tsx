import { useCallback } from 'react'
import { Form, Field } from 'react-final-form'
import { FormApi } from 'final-form'
import Button from 'src/components/Button'
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
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="font-medium">Name</label>
            <Field
              id="name"
              name="name"
              component="input"
              className="w-96 bg-gray-700 border border-gray-500 p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="url" className="font-medium">URL</label>
            <Field
              id="url"
              name="url"
              component="input"
              className="w-96 bg-gray-700 border border-gray-500 p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
            />
          </div>

          <div>
            {submitError && <div className="text-red-600">{submitError}</div>}
            <div className="flex items-end h-full">
              <Button
                type="submit"
                disabled={submitting || values.name === undefined || values.url === undefined}
                className="h-9 py-1 px-8 bg-gray-800 text-white rounded text-lg shadow-none hover:shadow-sm"
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
