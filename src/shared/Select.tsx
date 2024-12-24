import { Select as MuiSelect, Option as MuiOption } from '@material-tailwind/react/components/Select'

const EXTRA_CLASSES  = 'border-0 text-primary disabled:!bg-transparent'
const LABEL_CLASSES = 'top-0 text-secondary after:border-0 peer-disabled:!text-secondary normal-case'
const MENU_CLASSES = 'rounded bg-tertiary text-primary border-0 normal-case'
const CONTAINER_CLASSES = 'min-w-fit'

export const Select = (props: any) => (
  <MuiSelect 
    {...props}
    aria-label={props.label}
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
    containerProps={{
      ...props.containerProps,
      className: `${CONTAINER_CLASSES} ${props.containerProps?.className ?? ''}`,
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
