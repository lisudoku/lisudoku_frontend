/* eslint-disable no-restricted-globals */
import { wasm_brute_solve, wasm_logical_solve } from 'lisudoku-solver'
import { SolverType } from 'src/types/wasm';
import { computeWasmConstraints } from 'src/utils/wasm'

self.onmessage = function(e: any) {
  const { constraints, solverType } = e.data
  const wasmConstraints = computeWasmConstraints(constraints)
  console.info('Running solver', solverType, wasmConstraints)
  let solution
  if (solverType === SolverType.Brute) {
    solution = wasm_brute_solve(wasmConstraints)
  } else {
    solution = wasm_logical_solve(wasmConstraints)
  }
  self.postMessage(solution)
}

// Send initial message to let parent know the initialization is done.
// Documentation says the incoming messages are queued, but it only worked by waiting
self.postMessage('init')

export {}
/* eslint-enable no-restricted-globals */
