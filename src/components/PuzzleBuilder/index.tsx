import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cloneDeep } from 'lodash-es'
import { useScreenshot, createFileName } from 'use-react-screenshot';
import { SudokuConstraints, SolutionStep } from 'lisudoku-solver';
import { useDispatch, useSelector } from 'src/hooks'
import { useControlCallbacks, useKeyboardHandler, useSolver } from './hooks'
import {
  addConstraint, changeArrowConstraintType, changeInputActive, changeKillerSum,
  changeSelectedCell,
  initPuzzle, receivedPuzzle,
} from 'src/reducers/builder'
import Radio from 'src/design_system/Radio'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import Button from 'src/design_system/Button'
import PuzzleActions from './PuzzleActions'
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
import { detectConstraints } from 'src/constraints/utils'
import { constraintDefinitions } from 'src/constraints/definitions'
import { ArrowConstraintType } from 'src/constraints/editorState'

const downloadImage = (image: string, { name = 'puzzle', extension = 'png' } = {}) => {
  const a = document.createElement('a')
  a.href = image
  a.download = createFileName(extension, name)
  a.click()
}

const PuzzleBuilder = ({ admin }: { admin: boolean }) => {
  const [exportOpen, setExportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importImageOpen, setImportImageOpen] = useState(false)
  const { gridSize: paramGridSize } = useParams()
  const dispatch = useDispatch()

  const importData = useImportParam()

  const runBruteSolver = useSolver(SolverType.Brute)
  const runLogicalSolver = useSolver(SolverType.Logical)

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
      runImport(importData).then((constraints) => {
        if (constraints !== undefined) {
          runLogicalSolver(constraints)
        }
      })
    } else {
      const gridSize = Number.parseInt(paramGridSize ?? '9')
      dispatch(initPuzzle({ gridSize, setterMode: admin }))
    }
  }, [dispatch, paramGridSize, admin, importData, runImport, runLogicalSolver])

  const showSolutionDifficultyHeatmap = useSelector(state => state.userData.settings?.solutionDifficultyHeatmap ?? false)
  const setterMode = useSelector(state => state.builder.setterMode)
  const inputActive = useSelector(state => state.builder.inputActive)
  const constraints = useSelector(state => state.builder.constraints)
  const editorState = useSelector(state => state.builder.constraintEditorState)
  const cellMarks = useSelector(state => state.builder.cellMarks)
  const committedConstraints = useSelector(state => state.builder.committedConstraints)
  const killerSum = useSelector(state => state.builder.constraintEditorState.killerSum ?? '')
  const bruteSolution = useSelector(state => state.builder.bruteSolution)
  const logicalSolution = useSelector(state => state.builder.logicalSolution)
  const logicalSolutionStepIndex = useSelector(state => state.builder.logicalSolutionStepIndex)
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
  if (logicalSolution !== null && logicalSolutionStepIndex !== null) {
    let selectedStep: SolutionStep | undefined
    if (logicalSolutionStepIndex === logicalSolution.steps.length) {
      selectedStep = logicalSolution.steps[logicalSolution.steps.length - 1]
    } else if (logicalSolutionStepIndex !== -1) {
      selectedStep = logicalSolution.steps[logicalSolutionStepIndex]
    }
    if (selectedStep !== undefined) {
      grid = selectedStep.grid
      usedMarks = selectedStep.candidates?.map(row => row.map(cellCandidates => ({ cornerMarks: cellCandidates })))
    }
  } else if (bruteSolution?.solution) {
    grid = bruteSolution?.solution
  } else if (cellMarks !== null) {
    usedMarks = cloneDeep(cellMarks)
  }

  const customGraphics = useSolutionCustomGraphics({
    logicalSolution,
    constraints,
    showSolutionDifficultyHeatmap,
    logicalSolutionStepIndex,
  })

  if (!constraints || !committedConstraints) {
    return null
  }

  const hideSelectedCells = logicalSolution &&
    logicalSolutionStepIndex !== -1 &&
    logicalSolutionStepIndex !== logicalSolution.steps.length
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
      />
      <ImportImageModal
        open={importImageOpen}
        onClose={() => setImportImageOpen(false)}
        onSuccess={handleImportImageSuccess}
        isAdmin={admin}
      />
      <div className="flex flex-wrap xl:flex-nowrap gap-10 w-full">
        {/* wrap the grid so we can screenshot it using the ref */}
        <div ref={gridWrapperRef} className="bg-primary">
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
                <ConstraintRadio id={ConstraintType.FixedNumber} />
                <ConstraintRadio id={ConstraintType.Regions} />
                <ConstraintRadio id={ConstraintType.Thermo} />
                <ConstraintRadio id={ConstraintType.Arrow} />
                <ConstraintRadio id={ConstraintType.ExtraRegions} />
                <ConstraintRadio id={ConstraintType.KillerCage} />
                <ConstraintRadio id={ConstraintType.KropkiConsecutive} />
                <ConstraintRadio id={ConstraintType.KropkiDouble} />
                <ConstraintRadio id={ConstraintType.Odd} />
                <ConstraintRadio id={ConstraintType.Even} />
                <ConstraintRadio id={ConstraintType.Renban} />
                <ConstraintRadio id={ConstraintType.Palindrome} />
                <div className="flex flex-col w-full mt-2 gap-y-1">
                  {editorState.type === ConstraintType.KillerCage && (
                    <Input
                      label="Sum"
                      type="number"
                      value={killerSum}
                      onChange={(sum: number | null) => dispatch(changeKillerSum(sum))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
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
                    <Button onClick={() => dispatch(addConstraint())}>
                      {editorState.type === ConstraintType.Regions ? 'Set' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <hr className="border-primary" />
            <div className="flex flex-wrap gap-x-3">
              <ConstraintCheckbox
                id={ConstraintType.PrimaryDiagonal}
                keyField="primaryDiagonal"
              />
              <ConstraintCheckbox
                id={ConstraintType.SecondaryDiagonal}
                keyField="secondaryDiagonal"
              />
              <ConstraintCheckbox
                id={ConstraintType.AntiKnight}
                keyField="antiKnight"
              />
              <ConstraintCheckbox
                id={ConstraintType.AntiKing}
                keyField="antiKing"
              />
              <ConstraintCheckbox
                id={ConstraintType.KropkiNegative}
                keyField="kropkiNegative"
              />
              <ConstraintCheckbox
                id={ConstraintType.TopBottom}
                keyField="topBottom"
              />
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
            runBruteSolver={runBruteSolver}
            runLogicalSolver={runLogicalSolver}
            onInputFocus={handleInputFocus}
            onInputBlur={handleInputBlur}
          />
        </div>
      </div>
    </>
  )
}

export default PuzzleBuilder
