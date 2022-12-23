import { useCallback, useMemo } from 'react'
import _ from 'lodash'
import { useWebsocket } from 'src/utils/websocket'
import { useDispatch, useSelector } from 'src/hooks'
import { initPuzzles, TvPuzzle, updatePuzzle } from 'src/reducers/tv'
const jcc = require('json-case-convertor')

export enum TvMessageType {
  PuzzleUpdate = 'puzzle_update',
  InitPuzzles = 'init_puzzles',
  PuzzleRemove = 'puzzle_remove',
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
      // TODO: will be called from the background worker
      // case TvMessageType.PuzzleRemove: {
      //   const id = message.data
      //   setTvPuzzles(puzzles => puzzles.filter(puzzle => {
      //     const tvPuzzleId = `${puzzle.userId}_${puzzle.puzzleId}`
      //     return tvPuzzleId !== id
      //   }))
      //   break
      // }
    }
  }, [])
  useWebsocket('TvChannel', handleMessage)

  const tvPuzzles = useSelector(state => state.tv.tvPuzzles)
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
  }
}
