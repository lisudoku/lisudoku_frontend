import classNames from 'classnames'
import ReactSlider, { ReactSliderProps } from 'react-slider'

const DEFAULT_SLIDER_CLASSES = 'w-full h-12'
const DEFAULT_THUMB_CLASSES = 'top-0.5 size-11 flex justify-center items-center bg-black text-white cursor-pointer text-md border-2 rounded-full border-gray-800'
const DEFAULT_TRACK_CLASSES = 'relative bg-gray-500 top-5 h-2.5'
const DEFAULT_MARK_CLASSES = 'cursor-pointer border-2 border-solid border-black rounded-full align-middle'

const Thumb = (props: any, state: any) => (
  <div {...props}>{state.valueNow}</div>
)

const Track = (props: any, state: any) => {
  props.style.left += 10
  props.style.right += 10
  return (<div {...props} index={state.index} />)
}

export const Slider = (props: ReactSliderProps) => (
  <ReactSlider
    renderThumb={Thumb}
    renderTrack={Track}
    {...props}
    className={classNames(DEFAULT_SLIDER_CLASSES, props.className)}
    thumbClassName={classNames(DEFAULT_THUMB_CLASSES, props.thumbClassName)}
    trackClassName={classNames(DEFAULT_TRACK_CLASSES, props.trackClassName)}
    markClassName={classNames(DEFAULT_MARK_CLASSES, props.markClassName)}
  />
)

export default Slider
