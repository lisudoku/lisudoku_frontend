import {
  Popover, PopoverHandler, PopoverContent,
} from '@material-tailwind/react'
import Button from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKeyboard } from '@fortawesome/free-solid-svg-icons'

const CTRL_KEY_NAME = navigator.userAgent.includes('Macintosh') ? 'Cmd' : 'Ctrl'

const ShortcutsButton = () => (
  <Popover placement="bottom">
    <PopoverHandler>
      <Button variant="filled" color="gray" className="hidden md:block w-full mt-2 md:mt-1">
        <FontAwesomeIcon icon={faKeyboard} />
        {' Shortcuts'}
      </Button>
    </PopoverHandler>
    <PopoverContent>
      <div><b>Move selected cell</b> - Arrows</div>
      <div><b>Toggle notes</b> - Space or Tab</div>
      <div><b>Undo</b> - {CTRL_KEY_NAME} + Z</div>
      <div><b>Redo</b> - {CTRL_KEY_NAME} + Shift + Z or {CTRL_KEY_NAME} + Y</div>
      <div><b>Select multiple cells</b> - {CTRL_KEY_NAME} + Click or Shift + Click</div>
      <div><b>Pause timer</b> - P</div>
    </PopoverContent>
  </Popover>
)

export default ShortcutsButton
