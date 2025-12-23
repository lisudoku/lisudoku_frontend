import { times } from 'lodash-es'
import classNames from 'classnames'
import Button from '../../design_system/Button'

type SudokuDigitInputProps = {
  gridSize: number
  disabled?: boolean
  onClick: (digit: number) => void
}

const SudokuDigitInput = ({ gridSize, disabled, onClick }: SudokuDigitInputProps) => {
  const buttonsPerRow = gridSize > 4 ? 3 : 2

  return (
    <div className="flex flex-wrap w-full">
      {times(gridSize).map(value => (
        <div key={value}
              className={classNames('h-12 md:h-20 grow md:pb-1 px-0.5 first:pl-0 last:pr-0', {
                'md:w-1/3': buttonsPerRow === 3,
                'md:w-1/2': buttonsPerRow === 2,
                'md:pl-0': value % buttonsPerRow === 0,
                'md:pr-0': value % buttonsPerRow === buttonsPerRow - 1,
              })}
        >
          <Button fullWidth
                  className="h-full text-4xl font-normal p-0"
                  disabled={disabled}
                  onClick={() => onClick(value + 1)}
          >
            {value + 1}
          </Button>
        </div>
      ))}
    </div>
  )
}

export default SudokuDigitInput
