import type { SudokuConstraints } from 'lisudoku-solver'
import { SolverType } from 'src/types/wasm'
import SolverWorker from 'src/workers/solver.worker?worker'
import type { WorkerSolutionResponse } from './types'

export class SolverWorkerClient {
  private solverType: SolverType
  private worker: Worker | null = null
  private readyPromise!: Promise<void>
  private isReady: boolean = false
  private pendingRunHandlers: { resolve: (value: any) => void, reject: (reason?: any) => void } | null = null

  constructor(solverType: SolverType) {
    this.solverType = solverType
    this.create()
  }

  private create() {
    let resolveReady: () => void
    this.isReady = false
    this.readyPromise = new Promise((resolve) => {
      resolveReady = () => {
        this.isReady = true
        resolve()
      }
    })

    const _worker = new SolverWorker()

    // Wait for 'ready' message and then mark worker as initialized
    _worker.addEventListener('message', (e) => {
      if (typeof e.data === 'object' && e.data.type === 'ready') {
        resolveReady()
      } else {
        this.pendingRunHandlers?.resolve(e.data)
      }
    })

    _worker.addEventListener('error', (e) => {
      console.error(e)
      this.pendingRunHandlers?.reject(e)
    })

    this.worker = _worker
  }

  async run(constraints: SudokuConstraints) {
    if (this.pendingRunHandlers !== null) {
      throw new Error(`Solver ${this.solverType} already running`)
    }

    await this.readyPromise

    // Send constraints and wait for the solution
    return new Promise<WorkerSolutionResponse>((resolve, reject) => {
      this.pendingRunHandlers = {
        resolve,
        reject,
      }
      if (this.worker === null) {
        throw new Error(`Solver ${this.solverType} has no worker`)
      }
      this.worker.postMessage({
        solverType: this.solverType,
        constraints,
      })
    }).finally(() => {
      this.pendingRunHandlers = null
    })
  }

  pending() {
    return !this.isReady || this.pendingRunHandlers !== null
  }

  terminate() {
    this.worker?.terminate()
    this.worker = null
    this.pendingRunHandlers?.reject(new DOMException('cancelled', 'AbortError'))
    this.pendingRunHandlers = null
  }

  terminated() {
    return this.worker === null
  }

  restart() {
    this.terminate()
    this.create()
  }
}
