import _ from 'lodash'
import { Select, Option } from '../../components/Select'
import { TrainerTechniqueDisplay } from 'src/utils/constants'
import { TrainerTechnique } from 'src/types'

const TrainerTechniqueSelect = ({ value, onChange }: TrainerTechniqueSelectProps) => (
  <Select value={value} onChange={onChange} label="Technique">
    {_.values(TrainerTechnique).map(value => (
      <Option key={value} value={value}>{TrainerTechniqueDisplay[value]}</Option>
    ))}
  </Select>
)

type TrainerTechniqueSelectProps = {
  value: TrainerTechnique,
  onChange: (technique: TrainerTechnique) => void,
}

export default TrainerTechniqueSelect
