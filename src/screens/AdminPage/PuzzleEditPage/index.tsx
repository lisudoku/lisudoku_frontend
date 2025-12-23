import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from 'src/design_system/LoadingSpinner'
import DifficultySelect from 'src/components/Puzzle/DifficultySelect'
import PuzzleCollectionsSelect from 'src/components/Puzzle/PuzzleCollectionsSelect'
import { useSelector } from 'src/hooks'
import { SudokuDifficulty } from 'src/types/sudoku'
import { apiUpdatePuzzle, fetchPuzzleById } from 'src/utils/apiService'
import { Form, Field } from 'react-final-form'
import Button from 'src/design_system/Button'
import { FORM_ERROR } from 'final-form'

export type PuzzleFormData = {
  difficulty: SudokuDifficulty
  sourceCollectionId: string
}

const puzzleToFormData = (puzzle: any) => ({
  difficulty: puzzle.difficulty,
  sourceCollectionId: puzzle.source_collection_id?.toString() ?? '',
})

const PuzzleEditPage = () => {
  const { id: paramId } = useParams()
  const id = paramId!

  const userToken = useSelector(state => state.userData.token!)
  const [ loading, setLoading ] = useState(true)
  const [ formData, setFormData ] = useState<PuzzleFormData>()

  useEffect(() => {
    fetchPuzzleById(id, userToken).then(data => {
      const puzzle = data.puzzles[0]
      const formData: PuzzleFormData = puzzleToFormData(puzzle)
      setFormData(formData)
      setLoading(false)
    })
  }, [id, userToken])

  const onSubmit = useCallback(async (values: Record<string, any>) => {
    const puzzle = values as PuzzleFormData
    const result = await apiUpdatePuzzle(id, puzzle, userToken)

    if (result.error) {
      return { [FORM_ERROR]: result.error }
    }

    const formData: PuzzleFormData = puzzleToFormData(result)
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
          <div className="flex flex-col w-64 gap-3">
            <Field
              id="difficulty"
              name="difficulty"
              component={({ input, ...rest }) => <DifficultySelect {...input} {...rest} />}
            />

            <Field
              id="sourceCollectionId"
              name="sourceCollectionId"
              component={({ input, ...rest }) => <PuzzleCollectionsSelect  {...input} {...rest} />}
              className="w-full"
            />

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

export default PuzzleEditPage
