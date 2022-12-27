import { useCallback, useMemo } from 'react'
import _ from 'lodash'
import { useWebsocket } from 'src/utils/websocket'
import { useDispatch, useSelector } from 'src/hooks'
import { TvPuzzle, initPuzzles, removePuzzles, updatePuzzle, updateViewerCount } from 'src/reducers/tv'

export enum TvMessageType {
  PuzzleUpdate = 'puzzle_update',
  InitPuzzles = 'init_puzzles',
  PuzzleRemove = 'puzzle_remove',
  ViewerCountUpdate = 'viewer_count_update',
}

type TvMessage = {
  type: TvMessageType
  data: any
}

export const useTvWebsocket = () => {
  const dispatch = useDispatch()

  const handleMessage = useCallback((message: TvMessage) => {
    switch (message.type) {
      case TvMessageType.InitPuzzles:
        dispatch(initPuzzles(message.data))
        break
      case TvMessageType.PuzzleUpdate:
        dispatch(updatePuzzle(message.data))
        break
      case TvMessageType.PuzzleRemove: {
        dispatch(removePuzzles(message.data))
        break
      }
      case TvMessageType.ViewerCountUpdate: {
        dispatch(updateViewerCount(message.data))
        break
      }
    }
  }, [dispatch])
  useWebsocket('TvChannel', handleMessage)

  const tvPuzzles = useSelector(state => state.tv.tvPuzzles)
  const viewerCount = useSelector(state => state.tv.viewerCount)
  const sortedTvPuzzles = useMemo(() => (
    _.orderBy(
      tvPuzzles,
      [
        (tvPuzzle: TvPuzzle) => tvPuzzle.constraints.gridSize,
        (tvPuzzle: TvPuzzle) => tvPuzzle.createdAt,
      ],
      ['desc', 'desc']
    )
  ), [tvPuzzles])

  return {
    tvPuzzles: sortedTvPuzzles,
    viewerCount,
  }
}
