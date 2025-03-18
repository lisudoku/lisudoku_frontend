import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cloneDeep, inRange } from 'lodash-es'
import classNames from 'classnames'
import { useScreenshot, createFileName } from 'use-react-screenshot';
import { useDispatch, useSelector } from 'src/hooks'
import { useControlCallbacks, useKeyboardHandler, useSolver } from './hooks'
import {
  addConstraint, ArrowConstraintType, changeArrowConstraintType, changeInputActive, changeKillerSum,
  changeSelectedCell,
  initPuzzle, receivedPuzzle,
} from 'src/reducers/builder'
import Radio from 'src/shared/Radio'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import Button from 'src/shared/Button'
import PuzzleActions from './PuzzleActions'
import { ConstraintType, Grid, SudokuConstraints } from 'src/types/sudoku'
import Input from 'src/shared/Input'
import Typography from 'src/shared/Typography'
import { importPuzzle, useImportParam } from 'src/utils/import'
import GridSizeSelect from './GridSizeSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faDownload } from '@fortawesome/free-solid-svg-icons'
import { SolverType } from 'src/types/wasm'
import { honeybadger } from 'src/components/HoneybadgerProvider'
import { defaultConstraints, detectConstraints, ensureDefaultRegions } from 'src/utils/sudoku';
import ExportModal from './ExportModal';
import ImportModal from './ImportModal';
import ImportImageModal from './ImportImageModal';
import ConstraintRadio from './ConstraintRadio';
import ConstraintCheckbox from './ConstraintCheckbox';
import { alert } from 'src/shared/ConfirmationDialog';

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

  const runImport = useCallback(async (url: string): Promise<SudokuConstraints | undefined> => {
    const result = await importPuzzle(url)
    if (result.error !== undefined) {
      await alert(result.error)
      if (url.length > 0 && !admin) {
        honeybadger.notify({
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
          honeybadger.notify({
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
          honeybadger.notify({
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

  const setterMode = useSelector(state => state.builder.setterMode)
  const inputActive = useSelector(state => state.builder.inputActive)
  const constraints = useSelector(state => state.builder.constraints)
  const selectedCells = useSelector(state => state.builder.selectedCells)
  const constraintType = useSelector(state => state.builder.constraintType)
  const arrowConstraintType = useSelector(state => state.builder.arrowConstraintType)
  const currentThermo = useSelector(state => state.builder.currentThermo)
  const currentArrow = useSelector(state => state.builder.currentArrow)
  const currentRenban = useSelector(state => state.builder.currentRenban)
  const currentPalindrome = useSelector(state => state.builder.currentPalindrome)
  const cellMarks = useSelector(state => state.builder.cellMarks)
  const constraintGrid = useSelector(state => state.builder.constraintGrid!)
  const killerSum = useSelector(state => state.builder.killerSum ?? '')
  const bruteSolution = useSelector(state => state.builder.bruteSolution?.solution)
  const logicalSolution = useSelector(state => state.builder.logicalSolution?.solution)
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

  const handleArrowConstraintTypeChange = useCallback((id: string) => {
    dispatch(changeArrowConstraintType(id))
  }, [dispatch])

  const handleConstraintAdd = useCallback(() => {
    dispatch(addConstraint())
  }, [dispatch])

  const handleKillerSumChange = useCallback((sum: number | null) => {
    dispatch(changeKillerSum(sum))
  }, [dispatch])

  const handleImportClick = useCallback(() => {
    setImportOpen(true)
  }, [])

  const handleImportConfirm = useCallback(async (url: string) => {
    const result = await runImport(url)
    if (result) {
      setImportOpen(false)
    }
  }, [runImport])

  const handleExportClick = useCallback(() => {
    setExportOpen(true)
  }, [])

  const gridWrapperRef = useRef<HTMLDivElement>(null)

  const [_image, takeScreenShot] = useScreenshot({
    type: 'image/png',
    quality: 1.0,
  })

  const handleImportImageClick = useCallback(() => {
    setImportImageOpen(true)
  }, [])

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

  // Visualize solutions while building the puzzle
  const solution = bruteSolution || logicalSolution
  const usedMarks = useMemo(() => {
    let marks = cloneDeep(cellMarks!)
    if (solution) {
      solution.forEach((solutionRow, rowIndex) => {
        solutionRow.forEach((digit, colIndex) => {
          if (digit !== null && digit !== 0) {
            marks[rowIndex][colIndex].centerMarks = [digit]
          }
        })
      })
    }
    return marks
  }, [cellMarks, solution])

  if (!constraints) {
    return null
  }

  let thermos = constraints?.thermos ?? []
  if (currentThermo.length > 0) {
    thermos = [ ...thermos, currentThermo ]
  }
  let arrows = constraints?.arrows ?? []
  if (currentArrow.arrowCells.length > 0 || currentArrow.circleCells.length > 0) {
    arrows = [ ...arrows, currentArrow ]
  }
  let renbans = constraints?.renbans ?? []
  if (currentRenban.length > 0) {
    renbans = [ ...renbans, currentRenban ]
  }
  let palindromes = constraints?.palindromes ?? []
  if (currentPalindrome.length > 0) {
    palindromes = [ ...palindromes, currentPalindrome ]
  }

  const constraintPreview = {
    ...constraints,
    thermos,
    arrows,
    renbans,
    palindromes,
  }

  // Not really used, but SudokuGrid needs them... there are better solutions
  const grid: Grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))

  let usedGrid = grid
  if (constraintType === ConstraintType.Regions) {
    usedGrid = constraintGrid
    constraintPreview.fixedNumbers = []
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
        constraints={constraints}
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
          <SudokuGrid
            constraints={constraintPreview}
            grid={usedGrid}
            cellMarks={usedMarks}
            selectedCells={selectedCells}
            checkErrors={constraintType === ConstraintType.FixedNumber}
            onCellClick={onCellClick}
          />
        </div>
        <div className="flex flex-col gap-2 w-full xl:max-w-[330px]">
          <div className="flex flex-col">
            <Typography variant="h6">
              Constraints
            </Typography>
            <div className="flex flex-wrap gap-x-3 pt-3">
              <div className="w-full ml-1">
                <div className="w-1/3">
                  <GridSizeSelect />
                </div>
              </div>
              <ConstraintRadio id={ConstraintType.FixedNumber} />
              <ConstraintRadio id={ConstraintType.Regions} />
              <ConstraintRadio
                id={ConstraintType.Thermo}
                labelProps={{ className: classNames({
                  'text-red-600': currentThermo.length === 1 || currentThermo.length > gridSize!,
                  'text-green-600': inRange(currentThermo.length, 2, gridSize! + 1),
                })}}
              />
              <ConstraintRadio
                id={ConstraintType.Arrow}
                labelProps={{ className: classNames({
                  'text-red-600': currentArrow.circleCells.length > 0 && currentArrow.arrowCells.length === 0,
                  'text-green-600': currentArrow.circleCells.length > 0 && currentArrow.arrowCells.length > 0,
                })}}
              />
              <ConstraintRadio id={ConstraintType.ExtraRegions} />
              <ConstraintRadio id={ConstraintType.KillerCage} />
              <ConstraintRadio id={ConstraintType.KropkiConsecutive} />
              <ConstraintRadio id={ConstraintType.KropkiDouble} />
              <ConstraintRadio id={ConstraintType.Odd} />
              <ConstraintRadio id={ConstraintType.Even} />
              <ConstraintRadio id={ConstraintType.Renban} />
              <ConstraintRadio id={ConstraintType.Palindrome} />
              <div className="flex flex-col w-full mt-2 gap-y-1">
                {constraintType === ConstraintType.KillerCage && (
                  <Input label="Sum"
                        type="number"
                        value={killerSum}
                        onChange={handleKillerSumChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                  />
                )}
                {constraintType === ConstraintType.Arrow && (
                  <>
                    <Typography variant="h6">
                      Arrow constraint
                    </Typography>
                    <div className="flex gap-2">
                      <Radio
                        name="arrow-build-item"
                        id={ArrowConstraintType.Circle}
                        label="Circle"
                        checked={arrowConstraintType === ArrowConstraintType.Circle}
                        onChange={handleArrowConstraintTypeChange}
                      />
                      <Radio
                        name="arrow-build-item"
                        id={ArrowConstraintType.Arrow}
                        label="Arrow"
                        checked={arrowConstraintType === ArrowConstraintType.Arrow}
                        onChange={handleArrowConstraintTypeChange}
                      />
                    </div>
                  </>
                )}
                {[ConstraintType.Thermo, ConstraintType.Regions, ConstraintType.KillerCage,
                  ConstraintType.KropkiConsecutive, ConstraintType.KropkiDouble,
                  ConstraintType.ExtraRegions, ConstraintType.Arrow, ConstraintType.Renban,
                  ConstraintType.Palindrome,
                ].includes(constraintType) && (
                  <Button onClick={handleConstraintAdd}>Add</Button>
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
          <hr />
          <div className="flex w-full mt-2 gap-x-1">
            <Button className="w-1/2" variant="outlined" onClick={handleImportClick}>
              <FontAwesomeIcon icon={faDownload} />{' '}
              Import
            </Button>
            <Button className="w-1/2" variant="outlined" onClick={handleExportClick}>
              <FontAwesomeIcon icon={faUpload} />{' '}
              Export
            </Button>
          </div>
          <div className="flex w-full gap-x-1">
            <Button className="w-1/2" variant="outlined" onClick={handleImportImageClick}>
              <FontAwesomeIcon icon={faDownload} />{' '}
              Import image
            </Button>
            <Button className="w-1/2" variant="outlined" onClick={handleExportImageClick}>
              <FontAwesomeIcon icon={faUpload} />{' '}
              Export image
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 grow">
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
