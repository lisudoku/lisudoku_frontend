import axios from 'axios'
import axiosThrottle from 'axios-request-throttle'
import { ActionType } from 'src/reducers/puzzle'
import { CellPosition, Grid, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

axios.defaults.baseURL = `${process.env.REACT_APP_API_BASE_URL}/api`

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

axiosThrottle.use(axios, { requestsPerSecond: 2 })

const generateHeader = (userToken: string | null) => {
  if (!userToken) {
    return undefined
  }

  return {
    'Authorization': `Bearer ${userToken}`,
  }
}

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
  userToken: string | null
) => {
  return axios.post(
    '/puzzles/random',
    {
      id_blacklist: idBlacklist,
    },
    {
      headers: generateHeader(userToken),
      params: {
        variant,
        difficulty,
      },
    }
  ).then(response => response.data)
}

export const fetchPuzzleByPublicId = async (id: string, userToken: string | null) => {
  return axios.get(`/puzzles/${id}`, {
    headers: generateHeader(userToken),
  }).then(response => response.data)
}

export type UserActionSlim = {
  type: ActionType
  cells: CellPosition[]
  value: number
  time: number
}

export const requestPuzzleCheck = async (id: string, grid: Grid, actions: UserActionSlim[]) => {
  return axios.post(`/puzzles/${id}/check`, {
    grid,
    actions,
  }, {
    // headers: {
    //   'Authorization': `Bearer ${userToken()}`,
    // },
  }).then(response => response.data)
}

export const fetchPuzzleCollection = async (id: string) => {
  return axios.get(`/puzzle_collections/${id}`)
              .then(response => response.data)
}

export const fetchAllCompetitions = async () => {
  return axios.get('/competitions').then(response => response.data)
}

export const fetchCompetitionById = async (id: string) => {
  return axios.get(`/competitions/${id}`).then(response => response.data)
}

export const fetchActiveCompetitions = async () => {
  return axios.get('/competitions', { params: { active: true } })
              .then(response => response.data)
}
