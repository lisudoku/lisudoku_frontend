/* eslint-disable no-restricted-globals */
import { type SudokuBruteSolveResult, SudokuConstraints, type SudokuLogicalSolveResult, wasm_brute_solve, wasm_logical_solve } from 'lisudoku-solver'
import { SolverType } from 'src/types/wasm';

self.onmessage = function(e: { data: { constraints: SudokuConstraints; solverType: SolverType } }) {
  const { constraints, solverType } = e.data
  console.info('Running solver', solverType, constraints)
  let solution: SudokuBruteSolveResult | SudokuLogicalSolveResult
  if (solverType === SolverType.Brute) {
    solution = wasm_brute_solve(constraints)
  } else {
    solution = wasm_logical_solve(constraints)
  }
  self.postMessage(solution)
}

// Send initial message to let parent know the initialization is done.
// Documentation says the incoming messages are queued, but it only worked by waiting
self.postMessage('init')

export {}
/* eslint-enable no-restricted-globals */
