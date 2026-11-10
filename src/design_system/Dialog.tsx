import {
  Dialog as MuiDialog,
  DialogBody as MuiDialogBody,
  type DialogBodyProps,
  type DialogProps,
} from '@material-tailwind/react/components/Dialog'
export { DialogHeader, DialogFooter } from '@material-tailwind/react/components/Dialog'

export const Dialog = (props: Omit<DialogProps, 'ref'>) => (
  <MuiDialog
    size="sm"
    className="bg-primary"
    {...props}
  />
)

export const DialogBody = (props: Omit<DialogBodyProps, 'ref'>) => (
  <MuiDialogBody
    className="text-primary"
    {...props}
  />
)
