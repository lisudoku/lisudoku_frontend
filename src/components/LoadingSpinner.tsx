import ClipLoader from 'react-spinners/ClipLoader'

const LoadingSpinner = ({ color, size, loading }: LoadingSpinnerProps) => (
  <ClipLoader
    color={color}
    loading={loading}
    size={size}
  />
)

LoadingSpinner.defaultProps = {
  color: '#607D8B',
  size: 50,
  loading: true,
}

type LoadingSpinnerProps = {
  color: string,
  size: number,
  loading: boolean,
}

export default LoadingSpinner
