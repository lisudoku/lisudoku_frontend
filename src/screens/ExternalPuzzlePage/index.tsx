import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { parseISO, differenceInSeconds } from 'date-fns'
import PageMeta from 'src/components/PageMeta'
import ErrorPage from 'src/components/ErrorPage'
import LoadingSpinner from 'src/shared/LoadingSpinner'
import Puzzle from 'src/components/Puzzle'
import { importPuzzle, ImportResult, useImportParam } from 'src/utils/import'
import { receivedPuzzle } from 'src/reducers/puzzle'
import { honeybadger } from 'src/components/HoneybadgerProvider'

const ExternalPuzzlePage = () => {
  const importData = useImportParam()

  const dispatch = useDispatch()

  const [ error, setError ] = useState(false)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)

  const isExternal = useSelector(state => state.puzzle.data?.isExternal)
  const externalData = useSelector(state => state.puzzle.data?.externalData)
  const solved = useSelector(state => state.puzzle.solved)
  const lastUpdate = useSelector(state => state.puzzle.lastUpdate)

  useEffect(() => {
    if (puzzleLoading || error) {
      return
    }
    if (importData === undefined) {
      setError(true)
      return
    }

    if (!isExternal ||
        (solved && differenceInSeconds(new Date(), parseISO(lastUpdate!)) >= 1) ||
        importData !== externalData) {
      setPuzzleLoading(true)
      importPuzzle(importData).then((result: ImportResult) => {
        if (result.error) {
          setError(true)
          honeybadger.notify({
            name: 'External puzzle import error',
            context: {
              importData,
              result,
            },
          })
        } else {
          dispatch(receivedPuzzle({
            constraints: result.constraints,
            isExternal: true,
            externalData: importData,
          }))
        }

        setPuzzleLoading(false)
        if (result.error) {
          throw new Error(result.error)
        }
      })
    }
  }, [dispatch, puzzleLoading, error, importData, isExternal, externalData, solved, lastUpdate])

  return (
    <>
      <PageMeta title={`External Puzzle`}
                url={`https://lisudoku.xyz/e?import=${importData}`}
                description="Solve an external puzzle" />
      {error ? (
        <ErrorPage />
      ) : (puzzleLoading) ? (
        <LoadingSpinner fullPage />
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default ExternalPuzzlePage
