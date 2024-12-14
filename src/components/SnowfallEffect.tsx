import { useState } from 'react'
import Snowfall from 'react-snowfall'
import useInterval from 'react-useinterval'

const SnowfallEffect = () => {
  const [snowflakeCount, setSnowflakeCount] = useState(200)
  useInterval(() => {
    setSnowflakeCount(x => Math.max(0, x - 10))
  }, 1000)

  if (snowflakeCount === 0) {
    return null
  }

  return <Snowfall
    snowflakeCount={snowflakeCount}
    speed={[0.5, 0.7]}
    style={{
      position: 'fixed',
      height: '100vh',
    }}
  />
}

export default SnowfallEffect
