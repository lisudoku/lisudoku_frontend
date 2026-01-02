import { useCallback, useMemo, useState } from 'react'
import SudokuGrid from './SudokuGrid'
import { SudokuControls } from './SudokuControls'
import SudokuMisc from './SudokuMisc'
import { useDispatch, useSelector } from 'src/hooks'
import { changePaused } from 'src/reducers/puzzle'
import { gridIsFull } from 'src/utils/sudoku'
import { updateVoiceWords, updateVoiceWordsPreview } from 'src/reducers/misc'
import { useVoice } from '../voice/VoiceProvider'
import type { VoiceHandlers } from '../voice/voice'
import { useTimerTick } from './hooks/useTimerTIck'
import { usePauseOnBlur } from './hooks/usePauseOnBlur'
import { useCheckSolvedState } from './hooks/useCheckSolvedState'
import { useTvPlayerWebsocket } from './hooks/useTvPlayerWebsocket'
import { useCellHighlights } from './hooks/useCellHighlights'
import { useControlCallbacks } from './hooks/useControlCallbacks'
import { PuzzleHeader } from './PuzzleHeader'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const dispatch = useDispatch()
  const [ isSolvedLoading, setIsSolvedLoading ] = useState(false)

  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const variant = useSelector(state => state.puzzle.data?.variant)
  const difficulty = useSelector(state => state.puzzle.data?.difficulty)
  const grid = useSelector(state => state.puzzle.grid)
  const cellMarks = useSelector(state => state.puzzle.cellMarks)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const paused = useSelector(state => state.puzzle.controls.paused)
  const checkErrors = useSelector(state => state.userData.settings?.checkErrors ?? true)
  const voiceEnabled = useSelector(state => state.userData.settings?.voiceEnabled ?? false)
  const solved = useSelector(state => state.puzzle.solved)

  const gridFull = useMemo(() => grid && gridIsFull(grid), [grid])
  const borderHighlightColor = useMemo(() => {
    if (!gridFull) {
      return undefined
    }
    if (isSolvedLoading) {
      return 'stroke-yellow-600'
    }
    if (solved === false) {
      return 'stroke-red-600'
    }
    return undefined
  }, [gridFull, isSolvedLoading, solved])

  useTvPlayerWebsocket()

  const cellHighlights = useCellHighlights()

  const handlePauseClick = useCallback(() => {
    dispatch(changePaused(false))
  }, [dispatch])

  const onWordsInput = useCallback((words: string) => {
    dispatch(updateVoiceWords(words))
  }, [dispatch])

  const onWordsInputPreview = useCallback((words: string) => {
    dispatch(updateVoiceWordsPreview(words))
  }, [dispatch])

  const {
    onSelectedCellChange, onSelectedCellValueChange, onUndo, onRedo,
    onNumbersActive, onCornerMarksActive, onCenterMarksActive,
    onSelectedCellDigitInput,
  } = useControlCallbacks(isSolvedLoading)

  const voiceHandlers: VoiceHandlers = useMemo(() => ({
    onWordsInput, onWordsInputPreview, onSelectedCellChange, onSelectedCellValueChange,
    onUndo, onRedo, onNumbersActive, onSelectedCellDigitInput, onCornerMarksActive,
    onCenterMarksActive,
  }), [
    onWordsInput, onWordsInputPreview, onSelectedCellChange, onSelectedCellValueChange,
    onUndo, onRedo, onNumbersActive, onSelectedCellDigitInput, onCornerMarksActive,
    onCenterMarksActive,
  ])
  useVoice(voiceEnabled, paused || Boolean(solved), voiceHandlers)

  useCheckSolvedState(setIsSolvedLoading)

  usePauseOnBlur(isSolvedLoading)

  useTimerTick(isSolvedLoading)

  if (constraints === undefined || variant === undefined || difficulty === undefined) {
    return null
  }

  return (
    <div className="w-fit flex flex-col md:flex-row mx-auto">
      <PuzzleHeader variant={variant} difficulty={difficulty} />
      <div className="order-3 md:order-1 w-full md:w-fit md:pr-5">
        <SudokuMisc />
      </div>
      <div className="order-1 md:order-2 w-full md:w-fit">
        <SudokuGrid
          constraints={constraints}
          grid={grid!}
          cellMarks={cellMarks!}
          selectedCells={selectedCells}
          checkErrors={checkErrors}
          loading={isSolvedLoading}
          onCellClick={onSelectedCellChange}
          paused={paused}
          onUnpause={handlePauseClick}
          highlightedCells={cellHighlights}
          borderHighlightColor={borderHighlightColor}
        />
      </div>
      <div className="order-2 md:order-3 w-full md:w-fit md:pl-5">
        <SudokuControls isSolvedLoading={isSolvedLoading} />
      </div>
    </div>
  )
}

export default PuzzleComponent
