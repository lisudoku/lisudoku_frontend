/* eslint-disable no-restricted-globals */
import { SudokuConstraints, wasm_brute_solve, wasm_logical_solve } from 'lisudoku-solver'
import type { WorkerSolutionResponse } from 'src/reducers/builder'
import { SolverType } from 'src/types/wasm'
import { encodeSudoku, SudokuDataFormat } from 'sudoku-formats';

self.onmessage = function(e: { data: { constraints: SudokuConstraints; solverType: SolverType } }) {
  const { constraints, solverType } = e.data
  console.info('Running solver', solverType, constraints)
  try {
    let response: WorkerSolutionResponse
    if (solverType === SolverType.Brute) {
      const solution = wasm_brute_solve(constraints)
      response = {
        solverType,
        solution,
      }
    } else {
      const solution = wasm_logical_solve(constraints)
      response = {
        solverType,
        solution,
      }
    }
    self.postMessage(response)
  } catch (error) {
    self.postMessage({
      solverType,
      error: 'Error while running solver',
    } satisfies WorkerSolutionResponse)

    throw new Error(
      `Error in ${solverType} solver with constraints ${encodeSudoku({ constraints, format: SudokuDataFormat.Lisudoku }).url}`,
      { cause: error },
    )
  }
}

// Send initial message to let parent know the initialization is done.
// Documentation says the incoming messages are queued, but it only worked by waiting
self.postMessage('init')

export {}
/* eslint-enable no-restricted-globals */
