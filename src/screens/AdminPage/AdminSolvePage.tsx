import { Link, useParams } from 'react-router-dom'
import LoadingSpinner from 'src/design_system/LoadingSpinner'
import Typography from 'src/design_system/Typography'
import SolveReplay from 'src/components/SolveReplay'
import { useSolve } from 'src/utils/solves'

const AdminSolvePage = () => {
  const { id: paramId } = useParams()
  const id = paramId!

  const { loading, userSolution, puzzleConstraints, variantDisplay } = useSolve(id)

  if (loading || userSolution === undefined || puzzleConstraints === undefined) {
    return <LoadingSpinner fullPage />
  }

  return (
    <>
      <div className="flex justify-between mb-3">
        <Typography variant="h3">
          Solve #{id} {variantDisplay && `(${variantDisplay})`}
        </Typography>
        <Link to="/admin/solves">Back to list</Link>
      </div>
      {userSolution.steps === undefined ? (
        // Old data
        <>No steps available</>
      ) : (
        <SolveReplay userSolution={userSolution} constraints={puzzleConstraints} />
      )}
    </>
  )
}

export default AdminSolvePage
