import axios from 'axios'

const SUDOKU_VISION_API_ENDPOINT = 'https://vision.lisudoku.xyz/parse_sudoku_image'

export const requestParseSudokuImage = async (formData: FormData) => {
  return axios.post<{ grid: string, error?: string }>(SUDOKU_VISION_API_ENDPOINT, formData, {
    validateStatus: () => true,
  })
}
