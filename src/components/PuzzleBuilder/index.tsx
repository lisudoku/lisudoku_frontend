import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cloneDeep } from 'lodash-es'
import { useScreenshot, createFileName } from 'use-react-screenshot';
import { SudokuConstraints, SolutionStep } from 'lisudoku-solver';
import { useDispatch, useSelector } from 'src/hooks'
import { useControlCallbacks, useKeyboardHandler, useSolver } from './hooks'
import {
  changeArrowConstraintType, changeInputActive, changeKillerSum,
  changeSelectedCell,
  initPuzzle, receivedPuzzle,
} from 'src/reducers/builder'
import Radio from 'src/design_system/Radio'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import Button from 'src/design_system/Button'
import { PuzzleActions } from './PuzzleActions'
import { CellMarks, ConstraintType, Grid } from 'src/types/sudoku'
import Input from 'src/design_system/Input'
import Typography from 'src/design_system/Typography'
import { importPuzzle, useImportParam } from 'src/utils/import'
import GridSizeSelect from './GridSizeSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faDownload } from '@fortawesome/free-solid-svg-icons'
import { SolverType } from 'src/types/wasm'
import { sendHbAlert } from 'src/components/HoneybadgerProvider'
import { defaultConstraints, ensureDefaultRegions } from 'src/utils/sudoku'
import ExportModal from './ExportModal'
import ImportModal from './ImportModal'
import ImportImageModal from './ImportImageModal'
import ConstraintRadio from './ConstraintRadio'
import ConstraintCheckbox from './ConstraintCheckbox'
import { alert } from 'src/design_system/ConfirmationDialog'
import { useSolutionCustomGraphics } from './hooks/useSolutionCustomGraphics'
import { assertExhaustiveConstraintOrder, detectConstraints } from 'src/constraints/utils'
import { constraintDefinitions } from 'src/constraints/definitions'
import { ArrowConstraintType } from 'src/constraints/editorState'
import { ConstraintAddButton } from './ConstraintAddButton'

const downloadImage = (image: string, { name = 'puzzle', extension = 'png' } = {}) => {
  const a = document.createElement('a')
  a.href = image
  a.download = createFileName(extension, name)
  a.click()
}

export const localConstraintsOrder = [
  ConstraintType.FixedNumber,
  ConstraintType.Regions,
  ConstraintType.Thermo,
  ConstraintType.Arrow,
  ConstraintType.ExtraRegions,
  ConstraintType.KillerCage,
  ConstraintType.KropkiConsecutive,
  ConstraintType.KropkiDouble,
  ConstraintType.Odd,
  ConstraintType.Even,
  ConstraintType.Renban,
  ConstraintType.Palindrome,
] as const satisfies readonly ConstraintType[]

export const globalConstraintsOrder = [
  ConstraintType.PrimaryDiagonal,
  ConstraintType.SecondaryDiagonal,
  ConstraintType.AntiKnight,
  ConstraintType.AntiKing,
  ConstraintType.KropkiNegative,
  ConstraintType.TopBottom,
] as const satisfies readonly ConstraintType[]

assertExhaustiveConstraintOrder([...localConstraintsOrder, ...globalConstraintsOrder])

const PuzzleBuilder = ({ admin }: { admin: boolean }) => {
  const [exportOpen, setExportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importImageOpen, setImportImageOpen] = useState(false)
  const { gridSize: paramGridSize } = useParams()
  const dispatch = useDispatch()

  const importData = useImportParam()

  const bruteSolver = useSolver(SolverType.Brute)
  const logicalSolver = useSolver(SolverType.Logical)

  const runImport = useCallback(async (url: string): Promise<SudokuConstraints | void> => {
    const result = await importPuzzle(url)
    if (result.error !== undefined) {
      await alert(result.error)
      if (url.length > 0 && !admin) {
        sendHbAlert({
          name: 'Puzzle import error',
          context: {
            url,
            result,
          },
        })
      }
    } else {
      dispatch(receivedPuzzle(result.constraints!))
      if (result.warning !== undefined) {
        await alert(`Puzzle imported partially. ${result.warning}`)
        if (!admin) {
          sendHbAlert({
            name: 'Puzzle import warning',
            context: {
              url,
              result,
            },
          })
        }
      } else {
        if (!admin) {
          const constraints = {
            ...defaultConstraints(result.constraints.gridSize),
            ...result.constraints,
          }
          sendHbAlert({
            name: 'Puzzle import success',
            context: {
              url,
              variant: detectConstraints(constraints).variant,
              result,
            },
          })
        }
      }
      // TODO: make SudokuConstraints.regions optional?
      const constraints: SudokuConstraints = {
        ...result.constraints,
        regions: result.constraints.regions ?? ensureDefaultRegions(result.constraints.gridSize),
      }
      return constraints
    }
  }, [dispatch, admin])

  useEffect(() => {
    if (importData) {
      dispatch(initPuzzle({ setterMode: admin }))
      runImport(importData).then((constraints) => {
        if (constraints !== undefined) {
          logicalSolver.run(constraints)
        }
      })
    } else {
      const gridSize = Number.parseInt(paramGridSize ?? '9')
      dispatch(initPuzzle({ gridSize, setterMode: admin }))
    }
  }, [dispatch, paramGridSize, admin, importData, runImport, logicalSolver])

  const showSolutionDifficultyHeatmap = useSelector(state => state.userData.settings?.solutionDifficultyHeatmap ?? false)
  const setterMode = useSelector(state => state.builder.setterMode)
  const inputActive = useSelector(state => state.builder.inputActive)
  const constraints = useSelector(state => state.builder.constraints)
  const editorState = useSelector(state => state.builder.constraintEditorState)
  const cellMarks = useSelector(state => state.builder.cellMarks)
  const committedConstraints = useSelector(state => state.builder.committedConstraints)
  const killerSum = useSelector(state => state.builder.constraintEditorState.killerSum ?? '')
  const bruteSolverState = useSelector(state => state.builder.bruteSolverState)
  const logicalSolverState = useSelector(state => state.builder.logicalSolverState)
  const gridSize = constraints?.gridSize

  useEffect(() => {
    if (gridSize && setterMode) {
      window.history.pushState(null , '', `/admin/build/${gridSize}`)
    }
  }, [gridSize, setterMode])

  const { onCellClick } = useControlCallbacks()

  useKeyboardHandler(!inputActive && !importOpen && !importImageOpen)

  const handleInputFocus = useCallback(() => {
    dispatch(changeInputActive(true))
  }, [dispatch])
  const handleInputBlur = useCallback(() => {
    dispatch(changeInputActive(false))
  }, [dispatch])

  const handleImportConfirm = useCallback(async (url: string) => {
    const result = await runImport(url)
    if (result) {
      setImportOpen(false)
    }
  }, [runImport])

  const gridWrapperRef = useRef<HTMLDivElement>(null)

  const [_image, takeScreenShot] = useScreenshot({
    type: 'image/png',
    quality: 1.0,
  })

  const handleImportImageSuccess = useCallback(async (gridString: string) => {
    // TODO: Maybe don't send a HB alert? Leave in for now...
    await runImport(gridString)
    setImportImageOpen(false)
  }, [])

  const handleExportImageClick = useCallback(() => {
    // Clear selected cell and generate the png
    dispatch(changeSelectedCell({ cell: null }))
    // Use the timeout to wait for the dispatch
    setTimeout(() => {
      if (gridWrapperRef.current) {
        takeScreenShot(gridWrapperRef.current).then(downloadImage)
      }
    }, 1)
  }, [dispatch, takeScreenShot, gridWrapperRef])

  let grid: Grid | undefined = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  let usedMarks: CellMarks[][] | undefined

  // Always prioritize logical solution (or specify why otherwise)
  if (logicalSolverState.solution !== undefined && logicalSolverState.solutionStepIndex !== undefined) {
    let selectedStep: SolutionStep | undefined
    if (logicalSolverState.solutionStepIndex === logicalSolverState.solution.steps.length) {
      selectedStep = logicalSolverState.solution.steps[logicalSolverState.solution.steps.length - 1]
    } else if (logicalSolverState.solutionStepIndex !== -1) {
      selectedStep = logicalSolverState.solution.steps[logicalSolverState.solutionStepIndex]
    }
    if (selectedStep !== undefined) {
      grid = selectedStep.grid
      usedMarks = selectedStep.candidates?.map(row => row.map(cellCandidates => ({ cornerMarks: cellCandidates })))
    }
  } else if (bruteSolverState.solution?.solution !== undefined) {
    grid = bruteSolverState.solution.solution
  } else if (cellMarks !== null) {
    usedMarks = cloneDeep(cellMarks)
  }

  const customGraphics = useSolutionCustomGraphics({
    logicalSolverState,
    constraints,
    showSolutionDifficultyHeatmap,
  })

  if (!constraints || !committedConstraints) {
    return null
  }

  const hideSelectedCells = logicalSolverState.solution !== undefined &&
    logicalSolverState.solutionStepIndex !== undefined
    logicalSolverState.solutionStepIndex !== -1 &&
    logicalSolverState.solutionStepIndex !== logicalSolverState.solution?.steps.length
  const displayedSelectedCells = hideSelectedCells ? [] : editorState.selectedCells

  let constraintPreview = constraints
  let usedGrid = grid
  if (editorState.type === ConstraintType.Regions) {
    usedGrid = editorState.regionsGrid
    constraintPreview = {
      ...constraintPreview,
      fixedNumbers: [],
    }
  }

  return (
    <>
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onConfirm={handleImportConfirm}
      />
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        constraints={committedConstraints}
        isAdminPage={admin}
      />
      <ImportImageModal
        open={importImageOpen}
        onClose={() => setImportImageOpen(false)}
        onSuccess={handleImportImageSuccess}
        isAdmin={admin}
      />
      <div className="flex flex-wrap xl:flex-nowrap gap-10 w-full" data-hb-name="puzzle-builder">
        {/* wrap the grid so we can screenshot it using the ref */}
        <div ref={gridWrapperRef} className="bg-primary" data-hb-name="grid-wrapper">
          {constraintPreview && (
            <SudokuGrid
              constraints={constraintPreview}
              grid={usedGrid}
              cellMarks={usedMarks}
              selectedCells={displayedSelectedCells}
              checkErrors={editorState.type !== ConstraintType.Regions}
              onCellClick={onCellClick}
              customGraphics={customGraphics}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 w-full xl:max-w-[330px]">
          <fieldset className="flex flex-col gap-2">
            <Typography variant="h6" as="legend">
              Constraints
            </Typography>
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-x-3 pt-3">
                <div className="w-full ml-1">
                  <div className="w-1/3">
                    <GridSizeSelect />
                  </div>
                </div>
                {localConstraintsOrder.map(constraintId => (
                  <ConstraintRadio key={constraintId} id={constraintId} />
                ))}
                {/* Extra input data needed for any constraint */}
                <div className="flex flex-col w-full mt-2 gap-y-1">
                  {editorState.type === ConstraintType.KillerCage && (
                    <Input
                      label="Sum"
                      type="number"
                      value={killerSum}
                      onChange={(sum: number | null) => dispatch(changeKillerSum(sum))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      min="1"
                    />
                  )}
                  {editorState.type === ConstraintType.Arrow && (
                    <>
                      <Typography variant="h6">
                        Arrow constraint
                      </Typography>
                      <div className="flex gap-2">
                        <Radio
                          name="arrow-build-item"
                          id={ArrowConstraintType.Circle}
                          label="Circle"
                          checked={editorState.arrowConstraintType === ArrowConstraintType.Circle}
                          onChange={(id: string) => dispatch(changeArrowConstraintType(id))}
                        />
                        <Radio
                          name="arrow-build-item"
                          id={ArrowConstraintType.Arrow}
                          label="Arrow"
                          checked={editorState.arrowConstraintType === ArrowConstraintType.Arrow}
                          onChange={(id: string) => dispatch(changeArrowConstraintType(id))}
                        />
                      </div>
                    </>
                  )}
                  {editorState.type !== ConstraintType.FixedNumber && !constraintDefinitions[editorState.type].isGlobal && (
                    <ConstraintAddButton />
                  )}
                </div>
              </div>
            </div>
            <hr className="border-primary" />
            <div className="flex flex-wrap gap-x-3">
              {globalConstraintsOrder.map((constraintId) => (
                <ConstraintCheckbox key={constraintId} id={constraintId} />
              ))}
            </div>
          </fieldset>
          <hr />
          <div className="flex w-full mt-2 gap-x-1">
            <Button
              className="w-1/2"
              variant="outlined"
              onClick={() => setImportOpen(true)}
              aria-label="Import a Sudoku puzzle from a supported format"
            >
              <FontAwesomeIcon icon={faDownload} />{' '}
              Import
            </Button>
            <Button
              className="w-1/2"
              variant="outlined"
              onClick={() => setExportOpen(true)}
              aria-label="Export the current Sudoku puzzle to a supported format"
            >
              <FontAwesomeIcon icon={faUpload} />{' '}
              Export
            </Button>
          </div>
          <div className="flex w-full gap-x-1">
            <Button
              className="w-1/2"
              variant="outlined"
              onClick={() => setImportImageOpen(true)}
              aria-label="Import a Sudoku puzzle from an image"
            >
              <FontAwesomeIcon icon={faDownload} />{' '}
              Import image
            </Button>
            <Button
              className="w-1/2"
              variant="outlined"
              onClick={handleExportImageClick}
              aria-label="Export the current Sudoku puzzle to an image"
            >
              <FontAwesomeIcon icon={faUpload} />{' '}
              Export image
            </Button>
          </div>
        </div>
        <div className="grow">
          <PuzzleActions
            bruteSolver={bruteSolver}
            logicalSolver={logicalSolver}
            onInputFocus={handleInputFocus}
            onInputBlur={handleInputBlur}
          />
        </div>
      </div>
    </>
  )
}

export default PuzzleBuilder
