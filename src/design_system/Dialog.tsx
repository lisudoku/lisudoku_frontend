import {
  Dialog as MuiDialog, DialogBody as MuiDialogBody, DialogFooter as MuiDialogFooter,
  DialogBodyProps, DialogProps,
} from '@material-tailwind/react'

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

export const DialogFooter = MuiDialogFooter
