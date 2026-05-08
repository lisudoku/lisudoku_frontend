import { isEqual, pullAllWith, uniqBy } from 'lodash-es'
import { useMemo } from 'react'
import { useSelector } from 'src/hooks'
import { HintLevel } from 'src/reducers/puzzle'
import { getCellPeers } from 'src/utils/sudoku'
import type { CustomGraphicsAreaHighlight, CustomGraphicsItem } from '../SudokuGridGraphics/CustomGraphics/CustomGraphics'
import { cellToCustomGraphicsItem } from '../SudokuGridGraphics/CustomGraphics/utils'
import { useStepCustomGraphics } from 'src/utils/stepsLogic/hooks'

export const useCustomGraphics = () : CustomGraphicsItem[] => {
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const hintSolution = useSelector(state => state.puzzle.controls.hintSolution)
  const userSettings = useSelector(state => state.userData.settings)

  const step = hintSolution?.steps[hintSolution.steps.length - 1]
  const hintGraphics = useStepCustomGraphics({
    step,
    constraints,
    disabled: hintLevel !== HintLevel.Big,
  })

  const peerGraphics = useMemo(() => {
    if (constraints === undefined || userSettings === undefined ||
      !userSettings.showPeers || selectedCells.length !== 1
    ) {
      return []
    }

    const selectedCell = selectedCells[0]
    const peers = getCellPeers(constraints, selectedCell)
    pullAllWith(peers, [selectedCell], isEqual)

    const customGraphics: CustomGraphicsAreaHighlight[] = peers.map(peer => cellToCustomGraphicsItem(peer, 'area'))

    return customGraphics
  }, [constraints, userSettings, selectedCells])

  const customGraphics = uniqBy(hintGraphics.concat(peerGraphics), 'area')

  return customGraphics
}
