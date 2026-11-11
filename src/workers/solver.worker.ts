/* eslint-disable no-restricted-globals */
import type { SudokuConstraints } from 'lisudoku-solver'
import { SolverType } from 'src/types/wasm'
import type { WorkerSolutionResponse } from './types'
import { logicalSolve, bruteSolve } from 'src/utils/wasm'

self.onmessage = function(e: { data: { constraints: SudokuConstraints; solverType: SolverType } }) {
  const { constraints, solverType } = e.data
  console.info('Running solver', solverType, constraints)
  try {
    let response: WorkerSolutionResponse
    if (solverType === SolverType.Brute) {
      const solution = bruteSolve(constraints)
      response = {
        solverType,
        solution,
      }
    } else {
      const solution = logicalSolve(constraints)
      response = {
        solverType,
        solution,
      }
    }
    self.postMessage(response)
  } catch (error) {
    self.postMessage({
      solverType,
      error: 'Error while running solver 🫠 Not sure why, but I will fix it soon!',
    } satisfies WorkerSolutionResponse)
  }
}

// Send initial message to let parent know the initialization is done.
// Documentation says the incoming messages are queued, but it only worked by waiting
// Apparently it's due to wasm async instantiation
self.postMessage({ type: 'ready' })

export {}
/* eslint-enable no-restricted-globals */
