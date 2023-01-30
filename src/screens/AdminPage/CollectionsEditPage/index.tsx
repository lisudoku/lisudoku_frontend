import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { Form, Field } from 'react-final-form'
import { FORM_ERROR } from 'final-form'
import Button from 'src/components/Button'
import LoadingSpinner from 'src/components/LoadingSpinner'
import { PuzzleCollection } from 'src/types'
import {
  apiUpdatePuzzleCollection, fetchPuzzleCollection, PuzzleCollectionInput,
} from 'src/utils/apiService'

const CollectionsEditPage = () => {
  const { id: paramId } = useParams()
  const id = paramId!
  const userToken = useSelector(state => state.userData.token!)

  const [ puzzleCollection, setPuzzleCollection ] = useState<PuzzleCollection>()

  useEffect(() => {
    fetchPuzzleCollection(id).then(puzzleCollection => {
      setPuzzleCollection(puzzleCollection)
    })
  }, [id, userToken])

  const onSubmit = useCallback(async (values: Record<string, any>) => {
    const puzzleCollection: PuzzleCollectionInput = {
      name: values.name,
      url: values.url,
    }
    const result = await apiUpdatePuzzleCollection(id, puzzleCollection, userToken)

    if (result.error) {
      return { [FORM_ERROR]: result.error }
    }

    setPuzzleCollection(result)
  }, [id, userToken])

  if (!puzzleCollection) {
    return <LoadingSpinner />
  }

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={puzzleCollection}
      render={({ handleSubmit, submitError, submitting, pristine }) => (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <div className="flex flex-col w-96 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-lg font-medium">Name</label>
              <Field
                id="name"
                name="name"
                component="input"
                className="w-full bg-gray-700 border border-gray-500 p-2 rounded outline-1 outline-gray-600 focus:outline-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="url" className="text-lg font-medium">URL</label>
              <Field
                id="url"
                name="url"
                component="input"
                className="w-full bg-gray-700 border border-gray-500 p-2 rounded outline-1 outline-gray-600 focus:outline-gray-600"
              />
            </div>

            <div>
              {submitError && <div className="text-red-600">{submitError}</div>}
              <div>
                <Button
                  type="submit"
                  disabled={submitting || pristine}
                  className="py-1 bg-gray-800 text-white rounded text-lg shadow-none hover:shadow-sm"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    />
  )
}

export default CollectionsEditPage
