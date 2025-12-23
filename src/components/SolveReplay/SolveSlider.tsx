import { ReactSliderProps } from 'react-slider'
import classNames from 'classnames'
import Slider from '../../design_system/Slider'
import { HistoryStep } from './useGridHistory'

interface SolveSlider extends Pick<ReactSliderProps, 'value' | 'onChange'> {
  history: HistoryStep[]
}

const SolveSlider = ({ history, value, onChange }: SolveSlider) => (
  <Slider
    marks
    min={0}
    max={history.length - 1}
    value={value}
    onChange={onChange}

    renderMark={(props) => {
      const markIndex = props.key as number
      const historyItem = history[markIndex]

      if (!historyItem.isBad && !historyItem.isWarn) {
        return null
      }

      return <span {...props} className={classNames(props.className, 'bottom-[calc(50%-6px)]', {
        'size-[11px] !bg-red-700 m-[0_19px]': historyItem.isBad,
        'size-[9px] !bg-yellow-200 m-[1px_19px]': !historyItem.isBad && historyItem.isWarn,
      })} />
    }}

    renderThumb={(props, state) => {
      const markIndex = state.valueNow

      return <div {...props} className={classNames(props.className, {
        "!bg-red-700 !text-white": history[markIndex].isBad,
        "!bg-yellow-200 !text-black": !history[markIndex].isBad && history[markIndex].isWarn,
      })}>{state.valueNow}</div>
    }}
  />
)

export default SolveSlider
