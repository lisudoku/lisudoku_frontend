import { Select, Option } from '../design_system/Select'
import { SudokuVariant } from 'src/types/sudoku'
import { ACTIVE_VARIANTS, SudokuVariantDisplay, SudokuVariantIcon } from 'src/utils/constants'

interface VariantSelectProps {
  value: SudokuVariant
  label?: string
  disabled?: boolean
  onChange?: (variant: SudokuVariant) => void
}

export const VariantSelect = ({ value, onChange, label = 'Variant', disabled = false }: VariantSelectProps) => (
  <Select value={value} onChange={onChange} label={label} disabled={disabled}>
    {ACTIVE_VARIANTS.map(value => (
      <Option key={value} value={value}>
        {SudokuVariantDisplay[value]}
        {' '}
        {SudokuVariantIcon[value]}
      </Option>
    ))}
  </Select>
)
