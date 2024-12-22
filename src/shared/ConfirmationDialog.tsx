import { Dialog, DialogBody, DialogFooter } from '@material-tailwind/react'
import { confirmable, createConfirmation } from 'react-confirm'
import Button from './Button'

interface ConfirmationDialogProps {
  show: boolean
  proceed: (value: boolean) => void
  confirmation: string
}

const ConfirmationDialogPure = ({ show, proceed, confirmation }: ConfirmationDialogProps) => (
  <Dialog open={show} handler={() => proceed(false)} size="sm" className="bg-primary">
    <DialogBody className="text-primary">{confirmation}</DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        onClick={() => proceed(false)}
        className="mr-1"
      >
        <span>Cancel</span>
      </Button>
      <Button variant="gradient" color="green" onClick={() => proceed(true)}>
        <span>Confirm</span>
      </Button>
    </DialogFooter>
  </Dialog>
)

const ConfirmationDialog = confirmable(ConfirmationDialogPure)

const confirmTemp = createConfirmation(ConfirmationDialog)

export const confirm = (confirmation: string) => (
  // @ts-expect-error types are incorrectly generated from createConfirmation, they should be optional
  confirmTemp({ confirmation })
)
