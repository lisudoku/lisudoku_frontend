import axios from 'axios'
import { Grid, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL

export * from './admin'

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response.status === 401 && window.location.pathname !== '/login') {
      (window.location as any) = '/logout'
    }
    return Promise.reject(error)
  }
)

export type LoginData = {
  username: string
  password: string
}

export const login = async (user: LoginData) => {
  return await axios.post('/users/login', {
    user,
  }).then(response => response.data)
    .catch(error => error.response.data)
}

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

export const fetchRandomPuzzle = async (
  variant: SudokuVariant, difficulty: SudokuDifficulty, idBlacklist: string[],
) => {
  return axios.post(
    '/puzzles/random',
    {
      id_blacklist: idBlacklist,
    },
    {
      // TODO: uncomment after allowing normal user accounts
      // headers: {
      //   'Authorization': `Bearer ${userToken()}`,
      // },
      params: {
        variant,
        difficulty,
      },
    }
  ).then(response => response.data)
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
