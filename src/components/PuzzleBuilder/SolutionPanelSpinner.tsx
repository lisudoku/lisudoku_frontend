import LoadingSpinner from 'src/design_system/LoadingSpinner'
import { formatElapsedTime, useElapsedTime } from './hooks'

interface SolutionPanelSpinnerProps {
  runStartedAt?: string
}

export const SolutionPanelSpinner = ({ runStartedAt }: SolutionPanelSpinnerProps) => {
  const elapsedTimeMs = useElapsedTime(runStartedAt)

  return (
    <div className="flex gap-2 items-center">
      {elapsedTimeMs >= 500 && (
        <>
          <LoadingSpinner size="xs" />
          {elapsedTimeMs >= 1_500 && (
            <span>{formatElapsedTime(elapsedTimeMs)}</span>
          )}
        </>
      )}
      <>&nbsp;</>
    </div>
  )
}
