import { Select as MuiSelect, Option as MuiOption } from '@material-tailwind/react'

export const Select = (props: any) => (
  <MuiSelect 
    {...props}
    variant="standard"
    size="md"
    color="gray"
    className={`border-0 text-gray-400 ${props.className ?? ''}`}
    labelProps={{
      ...props.labelProps,
      className: `top-0 text-gray-400 after:border-0 ${props.labelProps?.className ?? ''}`,
    }}
    menuProps={{
      ...props.menuProps,
      className: `rounded bg-gray-500 text-white border-0 ${props.menuProps?.className ?? ''}`,
    }}
  >
    {props.children}
  </MuiSelect>
)

export const Option = (props: any) => (
  <MuiOption
    {...props}
    className={`rounded ${props.className}`}
  >
    {props.children}
  </MuiOption>
)
