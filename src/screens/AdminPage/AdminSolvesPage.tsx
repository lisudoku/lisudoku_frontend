import { useEffect, useState } from 'react'
import { useSelector } from 'src/hooks'
import LoadingSpinner from 'src/shared/LoadingSpinner'
import Typography from 'src/shared/Typography'
import { UserSolution } from 'src/types'
import { fetchAllUserSolutions } from 'src/utils/apiService'
import { camelCaseKeys } from 'src/utils/json'
import SolvesTable from 'src/components/SolvesTable'

const AdminSolvesPage = () => {
  const [loading, setLoading] = useState(true)
  const [userSolutions, setUserSolutions] = useState<UserSolution[]>()
  const userToken = useSelector(state => state.userData!.token)

  useEffect(() => {
    setLoading(true)
    fetchAllUserSolutions(userToken!).then(data => {
      const userSolutions = camelCaseKeys(data.user_solutions)
      setUserSolutions(userSolutions)
      setLoading(false)
    })
  }, [userToken])

  if (loading || userSolutions === undefined) {
    return <LoadingSpinner fullPage />
  }

  return (
    <>
      <Typography variant="h3">
        Solves
      </Typography>
      <SolvesTable userSolutions={userSolutions} />
    </>
  )
}

export default AdminSolvesPage
