import _ from 'lodash'
import { Select, Option } from '../Select'
import { SudokuVariant } from 'src/types/sudoku'
import { SudokuVariantDisplay } from 'src/utils/constants'

const VariantSelect = () => {
  return (
    <>
      <Select value="classic" label="Variant">
        {_.values(SudokuVariant).map(value => (
          <Option key={value} value={value}>{SudokuVariantDisplay[value]}</Option>
        ))}
      </Select>
    </>
  )
}

export default VariantSelect
