import { Spinner } from '@material-tailwind/react/components/Spinner'
import { colors } from '@material-tailwind/react/types/generic'
import classNames from 'classnames'

const LoadingSpinner = ({ color, size, fullPage }: LoadingSpinnerProps) => {
  const loadingSpinner = (
    <Spinner
      color={color}
      className={classNames({
        'h-12 w-12': size === 'lg',
        'h-6 w-6': size === 'sm',
      })}
    />
  )

  if (fullPage) {
    return (
      <div className="flex w-full justify-center pt-20">
        {loadingSpinner}
      </div>
    )
  }

  return loadingSpinner
}

LoadingSpinner.defaultProps = {
  color: 'blue-gray',
  size: 'lg',
  fullPage: false,
}

type LoadingSpinnerProps = {
  color: colors
  size: 'sm' | 'lg'
  fullPage: boolean
}

export default LoadingSpinner
