import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from 'src/shared/LoadingSpinner'
import PuzzleCollectionsSelect from 'src/components/Puzzle/PuzzleCollectionsSelect'
import { useSelector } from 'src/hooks'
import { apiUpdateCompetition, CompetitionInput, fetchCompetitionById } from 'src/utils/apiService'
import { Form, Field } from 'react-final-form'
import Button from 'src/shared/Button'
import Input from 'src/shared/Input'
import { FORM_ERROR } from 'final-form'

export type CompetitionFormData = {
  name: string
  url: string
  from_date: string
  to_date: string
  puzzle_collection_id: string
  ib_puzzle_collection_id: string
}

const competitionToFormData = (competition: any) => ({
  name: competition.name,
  url: competition.url,
  from_date: new Date(competition.from_date).toISOString().slice(0, -1),
  to_date: new Date(competition.to_date).toISOString().slice(0, -1),
  puzzle_collection_id: competition.puzzle_collection_id?.toString() ?? '',
  ib_puzzle_collection_id: competition.ib_puzzle_collection_id?.toString() ?? '',
})

const CompetitionEditPage = () => {
  const { id: paramId } = useParams()
  const id = paramId!

  const userToken = useSelector(state => state.userData.token!)
  const [ loading, setLoading ] = useState(true)
  const [ formData, setFormData ] = useState<CompetitionFormData>()

  useEffect(() => {
    fetchCompetitionById(id).then(competition => {
      const formData: CompetitionFormData = competitionToFormData(competition)
      setFormData(formData)
      setLoading(false)
    })
  }, [id, userToken])

  const onSubmit = useCallback(async (values: Record<string, any>) => {
    const competition: CompetitionInput = {
      name: values.name,
      url: values.url,
      fromDate: values.from_date,
      toDate: values.to_date,
      puzzleCollectionId: values.puzzle_collection_id,
      ibPuzzleCollectionId: values.ib_puzzle_collection_id,
    }
    const result = await apiUpdateCompetition(id, competition, userToken)

    if (result.error) {
      return { [FORM_ERROR]: result.error }
    }

    const formData: CompetitionFormData = competitionToFormData(result)
    setFormData(formData)
  }, [id, userToken])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={formData}
      render={({ handleSubmit, submitError, submitting, pristine }) => (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <div className="flex flex-col gap-3">
            <div>
              <Field name="name">
                {props => (
                  <Input {...props.input} label="Name" className="w-full" />
                )}
              </Field>
            </div>

            <div>
              <Field name="url">
                {props => (
                  <Input {...props.input} label="URL" className="w-full" />
                )}
              </Field>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="from_date" className="font-medium">From Date</label>
              <Field
                id="from_date"
                name="from_date"
                component="input"
                type="datetime-local"
                className="bg-secondary border border-secondary p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="to_date" className="font-medium">To Date</label>
              <Field
                id="to_date"
                name="to_date"
                component="input"
                type="datetime-local"
                className="bg-secondary border border-secondary p-1 rounded outline-1 outline-gray-600 focus:outline-gray-600"
              />
            </div>

            <div>
              <Field
                id="ib_puzzle_collection_id"
                name="ib_puzzle_collection_id"
                component={({ input, ...rest }) => <PuzzleCollectionsSelect  {...input} {...rest} label="IB Puzzle Collection" />}
              />
            </div>

            <div>
              <Field
                id="puzzle_collection_id"
                name="puzzle_collection_id"
                component={({ input, ...rest }) => <PuzzleCollectionsSelect {...input} {...rest} label="Puzzle Collection" />}
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

export default CompetitionEditPage
