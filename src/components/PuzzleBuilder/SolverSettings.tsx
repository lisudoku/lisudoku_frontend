import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { updateSolutionDifficultyHeatmap } from 'src/reducers/userData'
import Alert from 'src/shared/Alert'
import Switch from 'src/shared/Switch'
import Typography from 'src/shared/Typography'

interface SolverSettingsProps {
  open: boolean
  onClose: () => void
}

export const SolverSettings = ({ open, onClose }: SolverSettingsProps) => {
  const dispatch = useDispatch()
  const showSolutionDifficultyHeatmap = useSelector(state => state.userData.settings?.solutionDifficultyHeatmap)

  const handleSwitchChange = useCallback((checked: boolean) => {
    dispatch(updateSolutionDifficultyHeatmap(checked))
  }, [dispatch])

  return (
    <Alert
      className="absolute h-full z-20"
      open={open}
      onClose={onClose}
    >
      <Typography variant="h3" className="pb-2 text-primary">
        Solver settings
      </Typography>
      <Switch
        label="Show cell difficulty heatmap"
        checked={showSolutionDifficultyHeatmap}
        onChange={handleSwitchChange}
      />
    </Alert>
  )
}
