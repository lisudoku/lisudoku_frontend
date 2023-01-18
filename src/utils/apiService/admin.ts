import axios from 'axios'
import { Puzzle } from 'src/types/sudoku'
const jcc = require('json-case-convertor')

export const fetchGroupCounts = async (userToken: string) => {
  return axios.get('/puzzles/group_counts', {
    headers: { 'Authorization': `Bearer ${userToken}` },
  }).then(response => response.data)
}

export const apiAddPuzzle = async (puzzle: Puzzle, userToken: string) => {
  const apiPuzzle = jcc.snakeCaseKeys(puzzle)
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
