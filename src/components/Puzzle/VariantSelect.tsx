import { values } from 'lodash-es'
import { Select, Option } from '../../design_system/Select'
import { SudokuVariant } from 'src/types/sudoku'
import { ACTIVE_VARIANTS, SudokuVariantDisplay } from 'src/utils/constants'

const VariantSelect = ({ value, onChange, label, disabled }: VariantSelectProps) => (
  <Select value={value} onChange={onChange} label={label} disabled={disabled}>
    {values(ACTIVE_VARIANTS).map(value => (
      <Option key={value} value={value}>{SudokuVariantDisplay[value]}</Option>
    ))}
  </Select>
)

VariantSelect.defaultProps = {
  label: 'Variant',
  disabled: false,
}

type VariantSelectProps = {
  value: SudokuVariant,
  label: string,
  onChange?: Function,
  disabled: boolean,
}

export default VariantSelect
