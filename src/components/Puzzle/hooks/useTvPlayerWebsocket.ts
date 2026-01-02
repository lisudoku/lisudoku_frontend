import { useEffect } from 'react'
import { useSelector } from 'src/hooks'
import { TvMessageType } from 'src/screens/TvPage/hooks'
import { useWebsocket } from 'src/utils/websocket'

export const useTvPlayerWebsocket = () => {
  const isExternal = useSelector(state => state.puzzle.data?.isExternal)
  const publicId = useSelector(state => state.puzzle.data?.publicId)
  const grid = useSelector(state => state.puzzle.grid)
  const cellMarks = useSelector(state => state.puzzle.cellMarks)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const solved = useSelector(state => state.puzzle.solved)

  const { ready, sendMessage } = useWebsocket('TvChannel', null, { is_player: true }, isExternal)

  useEffect(() => {
    if (!ready || publicId === undefined) {
      return
    }
    if (isExternal) {
      // Don't show external puzzles on TV
      return
    }
    sendMessage({
      type: TvMessageType.PuzzleUpdate,
      data: {
        puzzle_id: publicId,
        grid,
        cell_marks: cellMarks,
        selected_cells: selectedCells,
        solved,
      },
    })
  }, [ready, publicId, sendMessage, grid, cellMarks, selectedCells, solved, isExternal])
}
