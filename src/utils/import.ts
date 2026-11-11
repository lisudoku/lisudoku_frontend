import { useLocation } from 'react-router-dom'
import type { SudokuConstraints } from 'lisudoku-solver'
import type { DecodeOutput, LisudokuConstraints, TransformOutput } from 'sudoku-formats'
import { encoder as encodeToLisudoku } from 'sudoku-formats/dist/formats/lisudoku/encoder'

export type ImportResult = TransformOutput<LisudokuConstraints> & { fromFormat: DecodeOutput['format'] }

export const importPuzzle = async (url: string): Promise<ImportResult> => {
  const { SudokuDataFormat, decodeSudoku, transformSudoku } = await import('sudoku-formats')
  const decode = await decodeSudoku(url)
  if (decode.error !== undefined) {
    return {
      error: decode.error,
      fromFormat: decode.format,
    }
  }

  const result = transformSudoku({
    constraints: decode.constraints,
    fromFormat: decode.format,
    toFormat: SudokuDataFormat.Lisudoku,
  })

  return {
    ...result,
    fromFormat: decode.format,
  }
}

const encodeConstraints = (constraints: SudokuConstraints) => {
  const { dataString } = encodeToLisudoku(constraints)
  return dataString
}

// Note: assumes <dataString> is already url escaped
export const buildLisudokuSolverUrl = (dataString: string) => (
  `${window.location.origin}/solver?import=${dataString}`
)

export const exportToLisudokuSolver = (constraints: SudokuConstraints) => {
  const encodedConstraints = encodeConstraints(constraints!)
  return buildLisudokuSolverUrl(encodedConstraints)
}

// Note: assumes <dataString> is already url escaped
export const buildLisudokuPuzzleUrl = (dataString: string) => (
  `${window.location.origin}/e?import=${dataString}`
)

export const exportToLisudokuPuzzle = (constraints: SudokuConstraints) => {
  const encodedConstraints = encodeConstraints(constraints!)
  return buildLisudokuPuzzleUrl(encodedConstraints)
}

export const useImportParam = (paramName: string = 'import') => {
  const { search } = useLocation()
  const importParam = new URLSearchParams(search).get(paramName)
  // Dirty hack for f-puzzles
  const importData = importParam?.replaceAll(' ', '+')

  return importData
}
