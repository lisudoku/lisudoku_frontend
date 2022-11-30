import axios from 'axios'
import _ from 'lodash'
import { Puzzle } from 'src/types/sudoku'

export const fetchGroupCounts = async () => {
  return axios.get('/admin/puzzle_counts', {
    // headers: {
    //   'Authorization': `Bearer ${userToken()}`,
    // },
  }).then(response => response.data)
}

export const apiAddPuzzle = async (puzzle: Puzzle) => {
  const apiPuzzle = {
    ...puzzle,
    constraints: _.mapKeys(puzzle.constraints, (_value, key) => _.snakeCase(key)),
  }
  return axios.post('/puzzles', {
    puzzle: apiPuzzle,
  }, {
    // headers: {
    //   'Authorization': `Bearer ${userToken()}`,
    // },
  }).then(response => response.data)
}