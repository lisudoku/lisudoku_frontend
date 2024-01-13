import { CardBody, Typography } from '@material-tailwind/react'
import Card from '../Card'
import TrainerTechniqueSelect from './TrainerTechniqueSelect'
import { useDispatch, useSelector } from 'src/hooks'
import { useCallback } from 'react'
import { TrainerTechnique } from 'src/types'
import { updateTechnique } from 'src/reducers/trainer'

const TrainerMisc = () => {
  const dispatch = useDispatch()
  const technique = useSelector(state => state.trainer.technique)

  const handleTechniqueChange = useCallback((technique: TrainerTechnique) => {
    dispatch(updateTechnique(technique))
  }, [dispatch])

  return (
    <div className="relative flex flex-col md:max-w-xs w-full md:w-72 mt-3 md:mt-0">
      <Card className="w-full">
        <CardBody>
          <Typography variant="h5">
            Trainer
          </Typography>
          <div className="w-full mt-4">
            <TrainerTechniqueSelect value={technique} onChange={handleTechniqueChange} />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default TrainerMisc
