import { SudokuConstraints } from 'lisudoku-solver'
import { useLocation } from 'react-router-dom'
import { DecodeOutput, decodeSudoku, encodeSudoku, SudokuDataFormat, TransformOutput, transformSudoku } from 'sudoku-formats'
import { LisudokuConstraints } from 'sudoku-formats/dist/formats/lisudoku'

export type ImportResult = TransformOutput<LisudokuConstraints> & { fromFormat: DecodeOutput['format'] }

export const importPuzzle = async (url: string): Promise<ImportResult> => {
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
  const { dataString } = encodeSudoku({ constraints, format: SudokuDataFormat.Lisudoku })
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
