import {
  Button, Popover, PopoverHandler, PopoverContent,
} from '@material-tailwind/react'

const CTRL_KEY_NAME = navigator.platform.indexOf('Mac') > -1 ? 'Cmd' : 'Ctrl'

const ShortcutsButton = () => (
  <Popover placement="bottom">
    <PopoverHandler>
      <Button variant="text" color="gray" className="w-fit">
        Shortcuts
      </Button>
    </PopoverHandler>
    <PopoverContent>
      <div><b>Move selected cell</b> - Arrows</div>
      <div><b>Toggle Notes</b> - N</div>
      <div><b>Undo</b> - {CTRL_KEY_NAME} + Z</div>
      <div><b>Redo</b> - {CTRL_KEY_NAME} + Y</div>
    </PopoverContent>
  </Popover>
)

export default ShortcutsButton
