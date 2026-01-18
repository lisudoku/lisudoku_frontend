import { isEqual, pullAllWith, uniqBy } from 'lodash-es'
import { useMemo } from 'react'
import { Theme, useTheme } from 'src/components/ThemeProvider'
import { useSelector } from 'src/hooks'
import type { CellHighlight } from '../SudokuGridGraphics'
import { HintLevel } from 'src/reducers/puzzle'
import { getCellPeers } from 'src/utils/sudoku'
import { useStepCellHighlights } from 'src/utils/techniqueHighlights'

export const useCellHighlights = () => {
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const hintSolution = useSelector(state => state.puzzle.controls.hintSolution)
  const userSettings = useSelector(state => state.userData.settings)
  const { theme } = useTheme()

  const cellColor = theme === Theme.Light ? 'grey' : 'lightgreen'

  const step = hintSolution?.steps[hintSolution.steps.length - 1]
  const hintHighlights = useStepCellHighlights({
    step,
    constraints,
    disabled: hintLevel !== HintLevel.Big,
  })

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
