import { wasm_brute_solve, wasm_logical_solve } from 'lisudoku-solver'
import { SolverType } from 'src/reducers/builder'
import { computeWasmConstraints } from 'src/utils/wasm'

// eslint-disable-next-line no-restricted-globals
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
  // eslint-disable-next-line no-restricted-globals
  self.postMessage(solution)
}

export {}
