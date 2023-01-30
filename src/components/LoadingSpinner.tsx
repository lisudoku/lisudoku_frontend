import ClipLoader from 'react-spinners/ClipLoader'

const LoadingSpinner = ({ color, size, loading, fullPage }: LoadingSpinnerProps) => {
  const loadingSpinner = (
    <ClipLoader
      color={color}
      loading={loading}
      size={size}
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
  color: '#607D8B',
  size: 50,
  loading: true,
  fullPage: false,
}

type LoadingSpinnerProps = {
  color: string
  size: number
  loading: boolean
  fullPage: boolean
}

export default LoadingSpinner
