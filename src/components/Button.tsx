import { ButtonProps, Button as MuiButton } from '@material-tailwind/react'
import classNames from 'classnames'
import { forwardRef } from 'react'

const EXTRA_CLASSNAME = 'rounded select-none outline-none focus:opacity-100 focus:ring-0'

const Button = forwardRef((props: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement | null>) => (
  <MuiButton {...props}
             ref={ref}
             size={props.size}
             color={props.color}
             className={classNames(EXTRA_CLASSNAME, props.className, {
               'text-gray-500': props.color === 'gray',
               'bg-gray-800': props.color === 'gray' && props.variant === 'filled',
               'text-inherit': props.color !== 'gray',
             })}>
    {props.children}
  </MuiButton>
))

Button.defaultProps = {
  color: 'blue-gray',
  size: 'sm',
}

export default Button
