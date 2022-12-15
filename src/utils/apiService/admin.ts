import axios from 'axios'
import _ from 'lodash'
import { Puzzle } from 'src/types/sudoku'

export const fetchGroupCounts = async (userToken: string) => {
  return axios.get('/puzzles/group_counts', {
    headers: { 'Authorization': `Bearer ${userToken}` },
  }).then(response => response.data)
}

export const apiAddPuzzle = async (puzzle: Puzzle, userToken: string) => {
  const apiPuzzle = {
    ...puzzle,
    constraints: _.mapKeys(puzzle.constraints, (_value, key) => _.snakeCase(key)),
  }
  return axios.post('/puzzles', {
    puzzle: apiPuzzle,
  }, {
    headers: { 'Authorization': `Bearer ${userToken}` },
  }).then(response => response.data)
}

export const apiDeletePuzzle = async (id: string, userToken: string) => {
  return axios.delete(`/puzzles/${id}`, {
    headers: { 'Authorization': `Bearer ${userToken}` },
  }).then(response => response.data)
}

export const fetchAllPuzzles = async (userToken: string) => {
  return axios.get('/puzzles', {
    headers: { 'Authorization': `Bearer ${userToken}` },
  }).then(response => response.data)
}
