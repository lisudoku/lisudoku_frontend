import ReactSlider, { ReactSliderProps } from 'react-slider'

const Thumb = (props: any, state: any) => (
  <div {...props}>{state.valueNow}</div>
)

const Track = (props: any, state: any) => {
  props.style.left += 10
  props.style.right += 10
  return (<div {...props} index={state.index} />)
}

const Slider = (props: ReactSliderProps) => (
  <ReactSlider
    className="w-full h-12"
    markClassName="cursor-pointer border-2 border-solid border-black rounded-full align-middle"
    thumbClassName="top-0.5 size-11 flex justify-center items-center bg-black text-white cursor-pointer text-md border-2 rounded-full border-gray-800"
    trackClassName="relative bg-gray-500 top-5 h-2.5"
    renderThumb={Thumb}
    renderTrack={Track}
    {...props}
  />
)

export default Slider
