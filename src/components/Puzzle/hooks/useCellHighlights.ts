import { isEqual, pullAllWith, uniqBy } from 'lodash-es'
import { useMemo } from 'react'
import type { CellPosition } from 'lisudoku-solver'
import { Theme, useTheme } from 'src/components/ThemeProvider'
import { useSelector } from 'src/hooks'
import type { CellHighlight } from '../SudokuGridGraphics'
import { HintLevel } from 'src/reducers/puzzle'
import { getAreaCells, getCellPeers } from 'src/utils/sudoku'

const OTHER_CELLS_COLOR = 'red'

export const useCellHighlights = () => {
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const hintSolution = useSelector(state => state.puzzle.controls.hintSolution)
  const userSettings = useSelector(state => state.userData.settings)
  const { theme } = useTheme()

  const areaColor = theme === Theme.Light ? 'grey' : 'lightgray'
  const cellColor = theme === Theme.Light ? 'grey' : 'lightgreen'

  const hintHighlights = useMemo(() => {
    if (constraints === undefined) {
      return []
    }
    if (hintLevel !== HintLevel.Big || hintSolution === null) {
      return []
    }

    let cellHighlights: CellHighlight[] = []

    // TODO: this highlight feature code should be more tightly coupled with the hint feature
    const step = hintSolution.steps![hintSolution.steps!.length - 1]
    if (!step) {
      return []
    }

    const cell = step.cells[0]
    const area = step.areas[0]
    const otherCells = step.cells.slice(1)

    switch (step?.rule) {
      case 'NakedSingle': {
        cellHighlights.push({
          position: cell,
          color: cellColor,
        })
        break
      }
      case 'HiddenSingle':
      case 'Thermo':
      case 'PalindromeValues': {
        cellHighlights = getAreaCells(area, constraints).map((areaCell: CellPosition) => ({
          position: areaCell,
          color: areaColor,
        }))
        otherCells.forEach(otherCell => {
          cellHighlights.push({
            position: otherCell,
            color: OTHER_CELLS_COLOR,
          })
        })
        cellHighlights.push({
          position: cell,
          color: cellColor,
        })
        break
      }
    }

    return cellHighlights
  }, [areaColor, cellColor, hintLevel, hintSolution, constraints, userSettings])

  const peersHighlights = useMemo(() => {
    if (constraints === undefined || userSettings === undefined ||
      !userSettings.showPeers || selectedCells.length !== 1
    ) {
      return []
    }

    const selectedCell = selectedCells[0]
    const peers = getCellPeers(constraints, selectedCell)
    pullAllWith(peers, [selectedCell], isEqual)

    const cellHighlights: CellHighlight[] = peers.map(peer => ({
      position: peer,
      color: cellColor,
    }))

    return cellHighlights
  }, [cellColor, constraints, userSettings, selectedCells])

  const cellHighlights = uniqBy(hintHighlights.concat(peersHighlights), 'position')

  return cellHighlights
}
