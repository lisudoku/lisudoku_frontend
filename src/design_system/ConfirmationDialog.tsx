import { confirmable, createConfirmation } from 'react-confirm'
import Button from './Button'
import { Dialog, DialogBody, DialogFooter } from './Dialog'

interface ConfirmationDialogOptions {
  confirmText?: string
  hideCancel?: boolean
}

interface ConfirmationDialogProps {
  show: boolean
  proceed: (value: boolean) => void
  confirmation: string
  options?: ConfirmationDialogOptions
}

const ConfirmationDialogPure = ({ show, proceed, confirmation, options }: ConfirmationDialogProps) => (
  <Dialog open={show} handler={() => proceed(false)}>
    <DialogBody>{confirmation}</DialogBody>
    <DialogFooter>
      {!options?.hideCancel && (
        <Button
          variant="text"
          onClick={() => proceed(false)}
          className="mr-1"
        >
          <span>Cancel</span>
        </Button>
      )}
      <Button variant="gradient" color="green" onClick={() => proceed(true)}>
        <span>{options?.confirmText ?? 'Confirm'}</span>
      </Button>
    </DialogFooter>
  </Dialog>
)

const ConfirmationDialog = confirmable(ConfirmationDialogPure)

const confirmAux = createConfirmation(ConfirmationDialog)

export const confirm = (confirmation: string) => (
  // @ts-expect-error types are incorrectly generated from createConfirmation, they should be optional
  confirmAux({ confirmation })
)

export const alert = (text: string) => (
  // @ts-expect-error types are incorrectly generated from createConfirmation, they should be optional
  confirmAux({ confirmation: text, options: { hideCancel: true, confirmText: 'Ok' } })
)
