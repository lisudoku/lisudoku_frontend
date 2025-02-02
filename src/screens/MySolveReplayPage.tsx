import { Link, useParams } from 'react-router-dom'
import ErrorPage from 'src/components/ErrorPage'
import PageMeta from 'src/components/PageMeta'
import SolveReplay from 'src/components/SolveReplay'
import LoadingSpinner from 'src/shared/LoadingSpinner'
import Typography from 'src/shared/Typography'
import { useSolve } from 'src/utils/solves'

const MySolveReplayPage = () => {
  const { id: paramId } = useParams()
  const id = paramId!

  // Note: Could maybe save locally
  const { loading, error, userSolution, puzzleConstraints, variantDisplay } = useSolve(id)

  return (
    <div className="px-4 py-3">
      <PageMeta
        title={`My Solve ${id}`}
        url={`https://lisudoku.xyz/mysolves/${id}`}
        description="Replay your puzzle solve"
      />
      {loading ? (
        <LoadingSpinner fullPage />
      ) : (error !== undefined || userSolution === undefined || puzzleConstraints === undefined) ? (
        <ErrorPage>
          {error ?? `Solve ${id} not found`}
        </ErrorPage>
      ) : userSolution.steps === undefined ? (
        <ErrorPage>
          {`Solve ${id} has incomplete data`}
        </ErrorPage>
      ) : (
        <>
          <div className="flex justify-between mb-3">
            <Typography variant="h3">
              Solve #{id} {variantDisplay && `(${variantDisplay})`}
            </Typography>
            <Link to="/mysolves">Back to list</Link>
          </div>
          <SolveReplay userSolution={userSolution} constraints={puzzleConstraints} />
        </>
      )}
    </div>
  )
}

export default MySolveReplayPage
