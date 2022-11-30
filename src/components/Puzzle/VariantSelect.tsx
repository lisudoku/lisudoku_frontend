import _ from 'lodash'
import { Select, Option } from '../Select'
import { SudokuVariant } from 'src/types/sudoku'
import { SudokuVariantDisplay } from 'src/utils/constants'

const VariantSelect = ({ value, onChange, label, disabled }: VariantSelectProps) => (
  <Select value={value} onChange={onChange} label={label} disabled={disabled}>
    {_.values(SudokuVariant).map(value => (
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
