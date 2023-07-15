import {
  Button, Popover, PopoverHandler, PopoverContent,
} from '@material-tailwind/react'

const CTRL_KEY_NAME = navigator.platform.indexOf('Mac') > -1 ? 'Cmd' : 'Ctrl'

const ShortcutsButton = () => (
  <Popover placement="bottom">
    <PopoverHandler>
      <Button variant="text" color="gray" className="hidden md:block w-full md:w-fit">
        Shortcuts
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
