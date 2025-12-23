import { values } from 'lodash-es'
import { Select, Option } from '../../design_system/Select'
import { TrainerTechniqueDisplay } from 'src/utils/constants'
import { TrainerTechnique } from 'src/types'

const TrainerTechniqueSelect = ({ value, onChange }: TrainerTechniqueSelectProps) => (
  <Select value={value} onChange={onChange} label="Technique">
    {values(TrainerTechnique).map(value => (
      <Option key={value} value={value}>{TrainerTechniqueDisplay[value]}</Option>
    ))}
  </Select>
)

type TrainerTechniqueSelectProps = {
  value: TrainerTechnique,
  onChange: (technique: TrainerTechnique) => void,
}

export default TrainerTechniqueSelect
