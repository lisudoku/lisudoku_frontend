import { Select as MuiSelect, Option as MuiOption } from '@material-tailwind/react'

const EXTRA_CLASSES  = 'border-0 text-gray-400 disabled:!bg-transparent'
const LABEL_CLASSES = 'top-0 text-gray-400 after:border-0 peer-disabled:!text-gray-400'
const MENU_CLASSES = 'rounded bg-gray-500 text-white border-0'

export const Select = (props: any) => (
  <MuiSelect 
    {...props}
    variant="standard"
    size="md"
    color="gray"
    className={`${EXTRA_CLASSES} ${props.className ?? ''}`}
    labelProps={{
      ...props.labelProps,
      className: `${LABEL_CLASSES} ${props.labelProps?.className ?? ''}`,
    }}
    menuProps={{
      ...props.menuProps,
      className: `${MENU_CLASSES} ${props.menuProps?.className ?? ''}`,
    }}
    arrow={props.disabled ? <></> : undefined}
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
