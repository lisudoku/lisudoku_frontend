import { forwardRef } from 'react'
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@material-tailwind/react/components/Tooltip'

interface TooltipProps extends MuiTooltipProps {}

const Tooltip = forwardRef((props: TooltipProps, ref: React.ForwardedRef<HTMLDivElement | null>) => (
  <>
    {props.content ? (
      <MuiTooltip {...props} ref={ref}>
        {props.children}
      </MuiTooltip>
    ) : (
      props.children
    )}
  </>
))

export default Tooltip
