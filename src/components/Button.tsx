import { forwardRef } from 'react'
import classNames from 'classnames'
import { ButtonProps, Button as MuiButton } from '@material-tailwind/react'

const EXTRA_CLASSNAME = 'rounded select-none outline-none focus:opacity-100 focus:ring-0'

const Button = forwardRef((props: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement | null>) => (
  <MuiButton
    {...props}
    ref={ref}
    size={props.size}
    color={props.color}
    className={classNames(EXTRA_CLASSNAME, props.className, {
      'text-primary': true,
      'bg-tertiary': props.color === 'gray' && props.variant === 'filled',
      'text-white':  props.color !== 'gray' && props.variant === 'filled',
    })}
  >
    {props.children}
  </MuiButton>
))

Button.defaultProps = {
  color: 'blue-gray',
  variant: 'filled',
  size: 'sm',
}

export default Button
