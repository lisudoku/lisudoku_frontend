import { useWindowSize } from '@react-hook/window-size'
import { getMonth, intervalToDuration, parseISO } from 'date-fns/esm'
import { DEFAULT_CELL_SIZE } from './constants'
import { MAIN_PADDING } from 'src/components/Layout'

export const XMAS_IS_HERE = getMonth(new Date()) === 11

export const getPuzzleFullUrl = (publicId: string) => (
  `${window.location.origin}/p/${publicId}`
)

export const getPuzzleRelativeUrl = (publicId: string) => (
  `/p/${publicId}`
)

export const getDurationShort = (date: string) => {
  const duration = intervalToDuration({
    start: parseISO(date),
    end: new Date(),
  })
  let str = ''
  if (duration.minutes) {
    str += `${duration.minutes}m`
  }
  if (duration.seconds || str === '') {
    str += `${duration.seconds}s`
  }
  return str
}

export const useCellSize = (gridSize?: number, scale: number = 1, widthExtraPadding: number = 0, heightExtraPadding: number = 0) => {
  const [ width, height ] = useWindowSize()

  if (gridSize === undefined) {
    return DEFAULT_CELL_SIZE
  }

  const widthPadding = 2 * MAIN_PADDING + widthExtraPadding
  const heightPadding = 50 + 2 * MAIN_PADDING + heightExtraPadding

  // Calculate the available screen width and subtract parent paddings
  const size = Math.min(width - widthPadding, height - heightPadding)

  // Should be synced with the formula in SudokuConstraintGraphics width={gridSize * cellSize + 2}
  let cellSize = (size - 2) / gridSize

  // For >= md screen sizes apply some adjustments (otherwise use the entire screen)
  if (width >= 768) {
    // Invers scaling with the grid size (4x4 will be smaller than 9x9, but not as much)
    cellSize *= gridSize / 9
    // Apply a downscale if provided
    cellSize *= scale
  }

  return  cellSize
}

export const pluralize = (count: number, word: string) => {
  if (count !== 1) {
    return word + 's'
  }
  return word
}

export const assert = (condition: boolean, message: string) => {
  if (!condition) {
    alert(message)
    throw Error(message)
  }
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}
