import axios from 'axios'
import { Grid, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL

// axios.interceptors.response.use(
//   response => {
//     return response
//   },
//   error => {
//     if (error.response.status === 401 && window.location.pathname !== '/login') {
//       (window.location as any) = '/logout'
//     }
//     return Promise.reject(error)
//   }
// )

// export const login = async user => {
//   try {
//     const response = await axios.post('/users/login', {
//       user,
//     })
//     return response.data
//   } catch (error) {
//     return error.response.data
//   }
// }

// export const register = async user => {
//   try {
//     const response = await axios.post('/users', {
//       user,
//     })
//     return response.data
//   } catch (error) {
//     return error.response.data
//   }
// }

export const fetchRandomPuzzle = async (variant: SudokuVariant, difficulty: SudokuDifficulty) => {
  return axios.get('/puzzles/random', {
    // headers: {
    //   'Authorization': `Bearer ${userToken()}`,
    // },
    params: {
      variant,
      difficulty,
    },
  }).then(response => response.data)
}

export const fetchPuzzleById = async (id: string) => {
  return axios.get(`/puzzles/${id}`, {
    // headers: {
    //   'Authorization': `Bearer ${userToken()}`,
    // },
  }).then(response => response.data)
}

export const requestPuzzleCheck = async (id: string, grid: Grid) => {
  return axios.post(`/puzzles/${id}/check`, {
    grid,
  }, {
    // headers: {
    //   'Authorization': `Bearer ${userToken()}`,
    // },
  }).then(response => response.data)
}
