import { useCallback } from 'react'
import { Form, Field } from 'react-final-form'
import { FormApi } from 'final-form'
import Button from 'src/components/Button'
import { useDispatch, useSelector } from 'src/hooks'
import { createdCompetition } from 'src/reducers/competitions'
import PuzzleCollectionsSelect from 'src/components/Puzzle/PuzzleCollectionsSelect'
import { CompetitionInput, createCompetition } from 'src/utils/apiService'

const AddCompetitionForm = () => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token!)

  const onSubmit = useCallback(async (values: Record<string, any>, form: FormApi) => {
    const competition: CompetitionInput = {
      name: values.name,
      url: values.url,
      fromDate: values.from_date,
      toDate: values.to_date,
      puzzleCollectionId: values.puzzle_collection_id,
      ibPuzzleCollectionId: values.ib_puzzle_collection_id,
    }
    const result = await createCompetition(competition, userToken)

    if (result.error) {
      return
    }

    dispatch(createdCompetition(result))
    form.reset()
  }, [dispatch, userToken])

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, submitError, submitting, values }) => (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4">
          <div className="w-full flex gap-2">
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
          </div>

          <div className="w-full flex gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="from_date" className="font-medium">From Date</label>
              <Field
                id="from_date"
                name="from_date"
                component="input"
                type="datetime-local"
                className="w-96 bg-gray-700 border border-gray-500 p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="to_date" className="font-medium">To Date</label>
              <Field
                id="to_date"
                name="to_date"
                component="input"
                type="datetime-local"
                className="w-96 bg-gray-700 border border-gray-500 p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
              />
            </div>
          </div>

          <div className="w-96">
            <Field
              id="ib_puzzle_collection_id"
              name="ib_puzzle_collection_id"
              component={({ input, ...rest }) => <PuzzleCollectionsSelect  {...input} {...rest} label="IB Puzzle Collection" />}
              className="bg-gray-700 border border-gray-500 p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
            />
          </div>

          <div className="w-96">
            <Field
              id="puzzle_collection_id"
              name="puzzle_collection_id"
              component={({ input, ...rest }) => <PuzzleCollectionsSelect {...input} {...rest} label="Puzzle Collection" />}
              className="bg-gray-700 border border-gray-500 p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
            />
          </div>

          <div>
            {submitError && <div className="text-red-600">{submitError}</div>}
            <div className="flex items-end h-full">
              <Button
                type="submit"
                disabled={
                  submitting || values.name === undefined || values.url === undefined ||
                  values.from_date === undefined || values.to_date === undefined
                }
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

export default AddCompetitionForm
