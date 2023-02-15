import { intervalToDuration, parseISO } from 'date-fns'
import { DEFAULT_CELL_SIZE } from './constants'

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

export const computeCellSize = (gridSize: number, width: number, ratio: number = 1.0) => {
  if (width >= 720) { // md
    return DEFAULT_CELL_SIZE * ratio
  }

  width = Math.min(width, 506)

  // Should be synced with the formula in SudokuConstraintGraphics width={gridSize * cellSize + 2}
  return (width - 2) / gridSize
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
